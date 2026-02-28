import { type Component } from 'solid-js';
import { HomeOutlined, LoadingOutlined, SettingFilled, SmileOutlined, SyncOutlined } from '../src'


const App: Component = () => {
  return (
    <main>
      <HomeOutlined />
      <SettingFilled />
      <SmileOutlined />
      <SyncOutlined spin />
      <SmileOutlined rotate={180} />
      <LoadingOutlined />
    </main>
  )
}

export default App;
