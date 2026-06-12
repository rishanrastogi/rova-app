package expo.modules.nowplaying

import android.content.ComponentName
import android.content.Context
import android.graphics.Bitmap
import android.media.MediaMetadata
import android.media.session.MediaController
import android.media.session.MediaSessionManager
import android.media.session.PlaybackState
import android.util.Base64
import java.io.ByteArrayOutputStream

data class NowPlayingState(
  val title: String?,
  val artist: String?,
  val album: String?,
  val isPlaying: Boolean,
  val packageName: String?,
  val artwork: String?
)

// Bridges the notification-listener service (which has access to MediaSessionManager)
// and the JS module (which polls this singleton for the latest snapshot).
object NowPlayingHolder {
  @Volatile
  var state: NowPlayingState? = null
    private set

  private var activeController: MediaController? = null
  private var activeCallback: MediaController.Callback? = null

  fun attach(sessionManager: MediaSessionManager, component: ComponentName) {
    refresh(sessionManager, component)
    sessionManager.addOnActiveSessionsChangedListener(
      { refresh(sessionManager, component) },
      component
    )
  }

  private fun refresh(sessionManager: MediaSessionManager, component: ComponentName) {
    val controllers = try {
      sessionManager.getActiveSessions(component)
    } catch (e: SecurityException) {
      emptyList()
    }

    val next = controllers.firstOrNull { it.playbackState?.state == PlaybackState.STATE_PLAYING }
      ?: controllers.firstOrNull()

    activeCallback?.let { activeController?.unregisterCallback(it) }
    activeController = next

    if (next == null) {
      state = null
      return
    }

    val callback = object : MediaController.Callback() {
      override fun onMetadataChanged(metadata: MediaMetadata?) = updateState(next)
      override fun onPlaybackStateChanged(playbackState: PlaybackState?) = updateState(next)
      override fun onSessionDestroyed() = refresh(sessionManager, component)
    }
    next.registerCallback(callback)
    activeCallback = callback
    updateState(next)
  }

  private fun updateState(controller: MediaController) {
    val metadata = controller.metadata
    val playbackState = controller.playbackState
    val bitmap: Bitmap? = metadata?.getBitmap(MediaMetadata.METADATA_KEY_ALBUM_ART)
      ?: metadata?.getBitmap(MediaMetadata.METADATA_KEY_ART)

    state = NowPlayingState(
      title = metadata?.getString(MediaMetadata.METADATA_KEY_TITLE),
      artist = metadata?.getString(MediaMetadata.METADATA_KEY_ARTIST),
      album = metadata?.getString(MediaMetadata.METADATA_KEY_ALBUM),
      isPlaying = playbackState?.state == PlaybackState.STATE_PLAYING,
      packageName = controller.packageName,
      artwork = bitmap?.let { bitmapToDataUri(it) }
    )
  }

  private fun bitmapToDataUri(bitmap: Bitmap): String {
    val stream = ByteArrayOutputStream()
    bitmap.compress(Bitmap.CompressFormat.PNG, 80, stream)
    return "data:image/png;base64," + Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP)
  }

  fun play() = activeController?.transportControls?.play()
  fun pause() = activeController?.transportControls?.pause()
  fun skipToNext() = activeController?.transportControls?.skipToNext()
  fun skipToPrevious() = activeController?.transportControls?.skipToPrevious()

  fun togglePlayPause() {
    if (state?.isPlaying == true) pause() else play()
  }
}
