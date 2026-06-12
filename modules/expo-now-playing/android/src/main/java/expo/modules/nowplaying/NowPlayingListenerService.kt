package expo.modules.nowplaying

import android.content.ComponentName
import android.content.Context
import android.media.session.MediaSessionManager
import android.service.notification.NotificationListenerService

// Notification access is required to query MediaSessionManager.getActiveSessions().
// We don't care about notifications themselves, only the access it grants to media sessions.
class NowPlayingListenerService : NotificationListenerService() {
  override fun onListenerConnected() {
    super.onListenerConnected()
    val sessionManager = getSystemService(Context.MEDIA_SESSION_SERVICE) as MediaSessionManager
    val component = ComponentName(this, NowPlayingListenerService::class.java)
    NowPlayingHolder.attach(sessionManager, component)
  }
}
