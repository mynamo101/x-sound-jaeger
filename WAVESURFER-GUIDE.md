# WaveSurfer 組件使用指南

本項目現在包含兩個音頻播放器組件，都基於 WaveSurfer.js 庫：

## 1. WaveSurfer 組件（完整版）

功能豐富的音頻播放器組件，支持更多自定義選項。

### 使用方法：

```jsx
<WaveSurfer 
  src="/path/to/audio.mp3"
  height={128}
  barWidth={2}
  barGap={1}
  waveColor="#A8DBA8"
  progressColor="#3B8686"
  cursorColor="#FF6B6B"
  barRadius={2}
  responsive={true}
  normalize={true}
/>
```

### 支持的屬性：

- `src` (必需): 音頻文件路徑
- `height`: 波形高度，默認 128px
- `barWidth`: 條形寬度，默認 2px
- `barGap`: 條形間距，默認 1px
- `waveColor`: 波形顏色，默認 #A8DBA8
- `progressColor`: 播放進度顏色，默認 #3B8686
- `cursorColor`: 光標顏色，默認 #FF6B6B
- `barRadius`: 條形圓角，默認 2px
- `responsive`: 響應式設計，默認 true
- `normalize`: 標準化音頻，默認 true

## 2. SimpleWaveSurfer 組件（簡化版）

更穩定、更簡單的音頻播放器組件，推薦日常使用。

### 使用方法：

```jsx
<SimpleWaveSurfer 
  src="/path/to/audio.mp3"
  height={80}
  waveColor="#ddd"
  progressColor="#333"
/>
```

### 支持的屬性：

- `src` (必需): 音頻文件路徑
- `height`: 波形高度，默認 80px
- `waveColor`: 波形顏色，默認 #ddd
- `progressColor`: 播放進度顏色，默認 #333

## 在 MDX 文件中使用

這兩個組件都已經通過 `astro-auto-import` 配置為全局組件，可以直接在 MDX 文件中使用，無需手動導入。

### 示例：

```mdx
# 我的音頻文章

這裡是一些文本內容...

## 音頻示例

<SimpleWaveSurfer src="/audio/example.mp3" />

更多文本內容...

<WaveSurfer 
  src="/audio/custom.wav"
  height={100}
  waveColor="#ff6b6b"
  progressColor="#4ecdc4"
/>
```

## 音頻文件放置

建議將音頻文件放在以下位置：
- `public/audio/` - 公開音頻文件
- `public/audio/packs/` - 音頻包文件

## 支持的音頻格式

- MP3
- WAV
- M4A
- FLAC
- OGG

## 瀏覽器兼容性

WaveSurfer.js 支持所有現代瀏覽器，包括：
- Chrome 57+
- Firefox 52+
- Safari 14+
- Edge 79+

## 故障排除

1. **音頻無法載入**: 檢查文件路徑是否正確，音頻文件是否存在
2. **跨域問題**: 確保音頻文件與網站在同一域名下，或服務器已配置 CORS
3. **組件不顯示**: 檢查控制台錯誤，確保 WaveSurfer.js 正確載入

## 性能優化

- 對於大型音頻文件，建議使用壓縮格式如 MP3
- 可以通過設置較小的 `height` 值來減少渲染負擔
- 推薦使用 SimpleWaveSurfer 組件以獲得更好的穩定性
