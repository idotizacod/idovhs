package com.idotiza.idovhs

import android.app.Activity
import android.content.ContentValues
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import android.webkit.JavascriptInterface
import android.webkit.MimeTypeMap
import android.widget.Toast
import java.util.Locale

class ExportBridge(private val activity: Activity) {

    @JavascriptInterface
    fun saveFile(dataUrl: String, fileName: String) {
        Thread {
            try {
                val separator = dataUrl.indexOf(',')
                if (!dataUrl.startsWith("data:") || separator < 0) {
                    throw IllegalArgumentException("URL de datos no válida")
                }

                val bytes = Base64.decode(dataUrl.substring(separator + 1), Base64.DEFAULT)
                val safeName = fileName
                    .replace('\\', '/')
                    .substringAfterLast('/')
                    .ifBlank { "idovhs-export.bin" }
                val extension = safeName.substringAfterLast('.', "").lowercase(Locale.ROOT)
                val mime = MimeTypeMap.getSingleton()
                    .getMimeTypeFromExtension(extension)
                    ?: "application/octet-stream"

                val uri = saveToDownloads(safeName, mime, bytes)
                activity.runOnUiThread {
                    val message = if (uri != null) {
                        "IDOVHS: guardado en Descargas/IDOVHS"
                    } else {
                        "IDOVHS: no se pudo guardar el archivo"
                    }
                    Toast.makeText(activity, message, Toast.LENGTH_LONG).show()
                }
            } catch (error: Exception) {
                activity.runOnUiThread {
                    Toast.makeText(
                        activity,
                        "IDOVHS: error al guardar (${error.message})",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        }.start()
    }

    private fun saveToDownloads(name: String, mime: String, bytes: ByteArray): Uri? {
        val resolver = activity.contentResolver
        val values = ContentValues().apply {
            put(MediaStore.Downloads.DISPLAY_NAME, name)
            put(MediaStore.Downloads.MIME_TYPE, mime)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/IDOVHS")
                put(MediaStore.Downloads.IS_PENDING, 1)
            }
        }

        val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values) ?: return null
        val written = resolver.openOutputStream(uri)?.use { stream ->
            stream.write(bytes)
            true
        } ?: false

        if (!written) {
            resolver.delete(uri, null, null)
            return null
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val pending = ContentValues().apply { put(MediaStore.Downloads.IS_PENDING, 0) }
            resolver.update(uri, pending, null, null)
        }
        return uri
    }
}
