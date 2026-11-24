package com.biosoundai

import android.os.Bundle
import android.widget.TextView
import androidx.activity.ComponentActivity

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val message = TextView(this).apply {
            text = "BioSound AI 4.0\\n\\nAndroid scaffold created.\\nNext: add yamnet.tflite and implement AudioRecord + MediaPipe streaming."
            textSize = 18f
            setPadding(40, 60, 40, 40)
        }
        setContentView(message)
    }
}
