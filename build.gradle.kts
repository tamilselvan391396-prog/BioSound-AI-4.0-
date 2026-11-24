plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}
android {
    namespace = "com.biosoundai"
    compileSdk = 35
    defaultConfig {
        applicationId = "com.biosoundai"
        minSdk = 26
        targetSdk = 35
        versionCode = 4
        versionName = "4.0.0"
    }
}
dependencies {
    implementation("com.google.mediapipe:tasks-audio:0.10.26")
    implementation("androidx.activity:activity-ktx:1.10.0")
    implementation("androidx.core:core-ktx:1.15.0")
}
