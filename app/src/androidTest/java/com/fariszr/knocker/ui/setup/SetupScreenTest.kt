package com.fariszr.knocker.ui.setup

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performTextInput
import com.fariszr.knocker.ui.theme.KnockerTheme
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mock
import org.mockito.Mockito.verify
import org.mockito.junit.MockitoJUnitRunner

@RunWith(MockitoJUnitRunner::class)
class SetupScreenTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Mock
    private lateinit var onSave: (String, String) -> Unit

    @Test
    fun setupScreen_displaysCorrectly() {
        composeTestRule.setContent {
            KnockerTheme {
                SetupScreen(onSave = onSave)
            }
        }

        composeTestRule.onNodeWithText("Knocker Endpoint").assertIsDisplayed()
        composeTestRule.onNodeWithText("API Token").assertIsDisplayed()
        composeTestRule.onNodeWithText("Save").assertIsDisplayed()
    }

    @Test
    fun setupScreen_savesSettings() {
        composeTestRule.setContent {
            KnockerTheme {
                SetupScreen(onSave = onSave)
            }
        }

        composeTestRule.onNodeWithText("Knocker Endpoint").performTextInput("http://127.0.0.1:8080")
        composeTestRule.onNodeWithText("API Token").performTextInput("test-token")
        composeTestRule.onNodeWithText("Save").performClick()

        verify(onSave).invoke("http://127.0.0.1:8080", "test-token")
    }
}