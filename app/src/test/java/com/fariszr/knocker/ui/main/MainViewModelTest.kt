package com.fariszr.knocker.ui.main

import app.cash.turbine.test
import com.fariszr.knocker.domain.usecase.WhitelistIpUseCase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.test.TestCoroutineDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.MockitoAnnotations

@ExperimentalCoroutinesApi
class MainViewModelTest {

    private val testDispatcher = TestCoroutineDispatcher()

    @Mock
    private lateinit var whitelistIpUseCase: WhitelistIpUseCase

    private lateinit var viewModel: MainViewModel

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
        MockitoAnnotations.openMocks(this)
        viewModel = MainViewModel(whitelistIpUseCase)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
        testDispatcher.cleanupTestCoroutines()
    }

    @Test
    fun `whitelistIp updates state to success`() = runBlocking {
        `when`(whitelistIpUseCase.invoke(null, null)).thenReturn(flowOf())

        viewModel.whitelistIp(null, null)

        viewModel.uiState.test {
            assertEquals("Whitelisted!", awaitItem())
        }
    }
}