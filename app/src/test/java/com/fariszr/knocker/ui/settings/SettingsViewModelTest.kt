package com.fariszr.knocker.ui.settings

import androidx.work.WorkManager
import com.fariszr.knocker.data.local.SettingsDataStore
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
class SettingsViewModelTest {

    private val testDispatcher = TestCoroutineDispatcher()

    @Mock
    private lateinit var workManager: WorkManager

    @Mock
    private lateinit var settingsDataStore: SettingsDataStore

    private lateinit var viewModel: SettingsViewModel

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
        MockitoAnnotations.openMocks(this)
        viewModel = SettingsViewModel(workManager, settingsDataStore)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
        testDispatcher.cleanupTestCoroutines()
    }

    @Test
    fun `toggle background service enables service`() = runBlocking {
        `when`(settingsDataStore.getKnockerEndpoint()).thenReturn(flowOf("http://127.0.0.1:8080"))
        `when`(settingsDataStore.getKnockerToken()).thenReturn(flowOf("test-token"))

        viewModel.toggleBackgroundService(true)

        verify(workManager).enqueue(viewModel.workRequest)
    }

    @Test
    fun `toggle background service disables service`() {
        viewModel.toggleBackgroundService(false)

        verify(workManager).cancelAllWork()
    }
}