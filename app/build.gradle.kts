import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val keystorePropertiesFile = rootProject.file(".local/keystore.properties")
val keystoreProperties = Properties().apply {
    if (keystorePropertiesFile.exists()) {
        keystorePropertiesFile.inputStream().use { load(it) }
    }
}

val buildWebAssets = tasks.register<Exec>("buildWebAssets") {
    group = "build"
    description = "Compila dist/ con npm antes de empaquetar los assets del APK."
    workingDir = rootProject.projectDir
    if (System.getProperty("os.name").lowercase().contains("windows")) {
        commandLine("cmd", "/c", "npm run build")
    } else {
        commandLine("npm", "run", "build")
    }
}

android {
    namespace = "com.idotiza.idovhs"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.idotiza.idovhs"
        minSdk = 30
        targetSdk = 35
        versionCode = 7
        versionName = "0.1.6"
    }

    signingConfigs {
        create("release") {
            val storeFilePath = keystoreProperties.getProperty("storeFile")
            storeFile = if (storeFilePath.isNullOrBlank()) {
                rootProject.file(".local/idovhs-release.jks")
            } else {
                rootProject.file(storeFilePath)
            }
            storePassword = keystoreProperties.getProperty("storePassword", "")
            keyAlias = keystoreProperties.getProperty("keyAlias", "")
            keyPassword = keystoreProperties.getProperty("keyPassword", "")
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            if (keystorePropertiesFile.exists()) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    sourceSets {
        getByName("main").assets.srcDir("../dist")
    }
}

tasks.named("preBuild") {
    dependsOn(buildWebAssets)
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.activity:activity-ktx:1.9.3")
}
