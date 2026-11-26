# IDOVHS: el puente de exportación se invoca desde JavaScript dentro de WebView.
-keepclassmembers class com.idotiza.idovhs.ExportBridge {
    @android.webkit.JavascriptInterface <methods>;
}

-keep class com.idotiza.idovhs.ExportBridge { *; }
