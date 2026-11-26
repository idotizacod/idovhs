package com.idotiza.idovhs

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.MimeTypeMap
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import java.io.ByteArrayInputStream
import java.io.IOException
import java.net.URLDecoder

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView
    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var pendingPermissionRequest: PermissionRequest? = null
    private var lastBackPressAt = 0L

    private val filePickerLauncher = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        val callback = filePathCallback
        filePathCallback = null
        callback?.onReceiveValue(uri?.let { arrayOf(it) } ?: emptyArray())
    }

    private val permissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { grants ->
            val request = pendingPermissionRequest
            pendingPermissionRequest = null
            if (request == null) return@registerForActivityResult

            val grantedResources = mutableListOf<String>()
            for (resource in request.resources) {
                val permission = when (resource) {
                    PermissionRequest.RESOURCE_VIDEO_CAPTURE -> Manifest.permission.CAMERA
                    PermissionRequest.RESOURCE_AUDIO_CAPTURE -> Manifest.permission.RECORD_AUDIO
                    else -> null
                }
                if (permission == null || grants[permission] == true) {
                    grantedResources.add(resource)
                }
            }

            if (grantedResources.isEmpty()) {
                request.deny()
            } else {
                request.grant(grantedResources.toTypedArray())
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(Color.WHITE)
        }
        setContentView(webView)

        configureWebView()
        webView.addJavascriptInterface(ExportBridge(this), JS_INTERFACE)
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                view?.evaluateJavascript(EXPORT_BRIDGE_SCRIPT, null)
            }

            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest
            ): WebResourceResponse? = assetResponse(request.url)

            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest): Boolean {
                val uri = request.url
                if (uri.host == ASSET_HOST) return false
                if (uri.scheme == "http" || uri.scheme == "https") {
                    startActivity(Intent(Intent.ACTION_VIEW, uri))
                    return true
                }
                return false
            }
        }
        webView.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                this@MainActivity.filePathCallback?.onReceiveValue(null)
                this@MainActivity.filePathCallback = filePathCallback
                filePickerLauncher.launch("*/*")
                return true
            }

            override fun onPermissionRequest(request: PermissionRequest?) {
                if (request == null) return
                val permissions = mutableListOf<String>()
                for (resource in request.resources) {
                    when (resource) {
                        PermissionRequest.RESOURCE_VIDEO_CAPTURE -> permissions.add(Manifest.permission.CAMERA)
                        PermissionRequest.RESOURCE_AUDIO_CAPTURE -> permissions.add(Manifest.permission.RECORD_AUDIO)
                    }
                }
                if (permissions.isEmpty()) {
                    request.grant(request.resources)
                    return
                }
                pendingPermissionRequest = request
                permissionLauncher.launch(permissions.toTypedArray())
            }

            override fun onConsoleMessage(message: ConsoleMessage?): Boolean {
                if (message != null) {
                    Log.d(
                        "IDOVHS-Web",
                        "${message.message()} @ ${message.lineNumber()}:${message.sourceId()}"
                    )
                }
                return true
            }
        }

        webView.loadUrl(ASSET_URL)

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                val now = System.currentTimeMillis()
                if (now - lastBackPressAt < 2000L) {
                    finish()
                } else {
                    lastBackPressAt = now
                    Toast.makeText(
                        this@MainActivity,
                        "Pulsa de nuevo para salir de IDOVHS",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        })
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun configureWebView() {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            mediaPlaybackRequiresUserGesture = false
            useWideViewPort = true
            loadWithOverviewMode = true
            cacheMode = WebSettings.LOAD_NO_CACHE
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
        }
    }

    private fun assetResponse(uri: Uri): WebResourceResponse? {
        if (uri.host != ASSET_HOST) return null

        val rawPath = uri.path ?: "/"
        val assetPath = URLDecoder.decode(
            if (rawPath == "/") "index.html" else rawPath.removePrefix("/"),
            "UTF-8"
        )

        // El service worker de la PWA no es necesario dentro del WebView y
        // puede servir-versiones antiguas tras actualizar el APK.
        if (assetPath == "sw.js") {
            return WebResourceResponse(
                "application/javascript",
                "UTF-8",
                ByteArrayInputStream(ByteArray(0))
            )
        }

        return try {
            WebResourceResponse(mimeFor(assetPath), "UTF-8", assets.open(assetPath))
        } catch (error: IOException) {
            WebResourceResponse(
                "text/plain",
                "UTF-8",
                ByteArrayInputStream("No encontrado: $assetPath".toByteArray())
            )
        }
    }

    private fun mimeFor(path: String): String {
        val extension = path.substringAfterLast('.', "").lowercase()
        return when (extension) {
            "html" -> "text/html"
            "js" -> "text/javascript"
            "css" -> "text/css"
            "json", "webmanifest" -> "application/json"
            "ttf" -> "font/ttf"
            "png" -> "image/png"
            "svg" -> "image/svg+xml"
            else -> MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension)
                ?: "application/octet-stream"
        }
    }

    override fun onDestroy() {
        filePathCallback?.onReceiveValue(null)
        filePathCallback = null
        webView.removeJavascriptInterface(JS_INTERFACE)
        webView.destroy()
        super.onDestroy()
    }

    private companion object {
        const val ASSET_HOST = "idovhs.local"
        const val ASSET_URL = "https://$ASSET_HOST/index.html"
        const val JS_INTERFACE = "IDOVHSApi"

        // WebView no descarga enlaces blob:, así que interceptamos las exportaciones
        // y las enviamos a MediaStore a través del puente Java.
        val EXPORT_BRIDGE_SCRIPT = """
            (() => {
              if (window.__idovhsExportBridgeInstalled === true) return;
              window.__idovhsExportBridgeInstalled = true;
              const blobs = new Map();

              const createObjectURL = URL.createObjectURL.bind(URL);
              URL.createObjectURL = (value) => {
                const url = createObjectURL(value);
                if (value instanceof Blob) blobs.set(url, value);
                return url;
              };

              const revokeObjectURL = URL.revokeObjectURL.bind(URL);
              URL.revokeObjectURL = (url) => {
                blobs.delete(url);
                return revokeObjectURL(url);
              };

              const originalClick = HTMLAnchorElement.prototype.click;
              HTMLAnchorElement.prototype.click = function () {
                const href = this.href || '';
                if (this.download && href.indexOf('blob:') === 0 && typeof window.IDOVHSApi !== 'undefined') {
                  const blob = blobs.get(href);
                  if (blob) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      window.IDOVHSApi.saveFile(
                        String(reader.result),
                        this.download || 'idovhs-export.bin'
                      );
                    };
                    reader.readAsDataURL(blob);
                    return;
                  }
                }
                return originalClick.call(this);
              };
            })();
        """.trimIndent()
    }
}
