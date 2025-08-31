package com.fariszr.knocker.ui.setup

import com.fariszr.knocker.domain.usecase.CheckHealthUseCase
import com.fariszr.knocker.domain.usecase.SaveSettingsUseCase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.test.TestCoroutineDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.mockito.Mock
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.mockito.MockitoAnnotations

@ExperimentalCoroutinesApi
class SetupViewModelTest {

    private val testDispatcher = TestCoroutineDispatcher()

    @Mock
    private lateinit var checkHealthUseCase: CheckHealthUseCase

    @Mock
    private lateinit var saveSettingsUseCase: SaveSettingsUseCase

    private lateinit var viewModel: SetupViewModel

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
        MockitoAnnotations.openMocks(this)
        viewModel = SetupViewModel(checkHealthUseCase, saveSettingsUseCase)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
        testDispatcher.cleanupTestCoroutines()
    }

    @Test
    fun `saveSettings saves settings and checks health`() = runBlocking {
        val endpoint = "http://127.0.0.1:8080"
        val token = "test-token"

        `when`(checkHealthUseCase.invoke()).thenReturn(flowOf())

        viewModel.saveSettings(endpoint, token)

        verify(saveSettingsUseCase).invoke(endpoint, token)
        verify(checkHealthUseCase).invoke()
    }
}