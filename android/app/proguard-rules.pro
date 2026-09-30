# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# react-native-config
-keep class com.gigpay.BuildConfig { *; }
-keep class com.lugg.ReactNativeConfig.** { *; }

# Zendesk
-keep class zendesk.** { *; }
-keep class com.zendesk.** { *; }

# Google Play Services & Location
-keep class com.google.android.gms.location.** { *; }
-dontwarn com.google.android.gms.location.**
-keep class com.google.android.gms.common.** { *; }
-dontwarn com.google.android.gms.common.**
-keep class com.google.android.gms.tasks.** { *; }
-dontwarn com.google.android.gms.tasks.**

# AndroidX Startup & WorkManager
-keep class androidx.startup.** { *; }
-dontwarn androidx.startup.**
-keep class androidx.work.** { *; }
-dontwarn androidx.work.**
-keep class * extends androidx.work.Worker { *; }
-keep class * extends androidx.work.ListenableWorker { *; }

