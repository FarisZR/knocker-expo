package com.fariszr.knocker.ui.main

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import com.fariszr.knocker.ui.theme.KnockerTheme
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mock
import org.mockito.Mockito.verify
import org.mockito.junit.MockitoJUnitRunner

@RunWith(MockitoJUnitRunner::class)
class MainScreenTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Mock
    private lateinit var onWhitelistClick: () -> Unit

    @Test
    fun mainScreen_displaysCorrectly() {
        composeTestRule.setContent {
            KnockerTheme {
                MainScreen("Ready", onWhitelistClick)
            }
        }

        composeTestRule.onNodeWithText("Ready").assertIsDisplayed()
        composeTestRule.onNodeWithText("Whitelist IP").assertIsDisplayed()
    }

    @Test
    fun mainScreen_callsWhitelistCallback() {
        composeTestRule.setContent {
            KnockerTheme {
                MainScreen("Ready", onWhitelistClick)
            }
        }

        composeTestRule.onNodeWithText("Whitelist IP").performClick()

        verify(onWhitelistClick).invoke()
    }
}