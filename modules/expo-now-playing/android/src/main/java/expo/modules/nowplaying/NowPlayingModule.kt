package expo.modules.nowplaying

import android.content.Intent
import android.provider.Settings
import androidx.core.app.NotificationManagerCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NowPlayingModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("NowPlaying")

    Function("isNotificationAccessGranted") {
      val context = appContext.reactContext ?: return@Function false
      NotificationManagerCompat.getEnabledListenerPackages(context).contains(context.packageName)
    }

    Function("openNotificationAccessSettings") {
      val context = appContext.reactContext
      if (context != null) {
        val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
      }
    }

    Function("getNowPlaying") {
      val s = NowPlayingHolder.state ?: return@Function null
      mapOf(
        "title" to s.title,
        "artist" to s.artist,
        "album" to s.album,
        "isPlaying" to s.isPlaying,
        "packageName" to s.packageName,
        "artwork" to s.artwork
      )
    }

    Function("play") { NowPlayingHolder.play() }
    Function("pause") { NowPlayingHolder.pause() }
    Function("togglePlayPause") { NowPlayingHolder.togglePlayPause() }
    Function("skipToNext") { NowPlayingHolder.skipToNext() }
    Function("skipToPrevious") { NowPlayingHolder.skipToPrevious() }
  }
}
