# Configuration File Format

## JSON Structure

Configuration file is a JSON array of objects:

```json
[
  {
    "prompt": "Your image generation prompt here",
    "outputName": "output_filename.png"
  }
]
```

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| prompt | string | Yes | Image description sent to Gemini |
| outputName | string | Yes | Output filename with extension (.png recommended) |

## Rules

- Each object = one image to generate
- outputName should include file extension (.png / .jpg / .webp)
- If output file already exists in output directory, it will be skipped
- Prompt length: no strict limit, but shorter prompts generate faster
- Chinese and English prompts both supported

## Example: 5 Chinese-themed images

```json
[
  {"prompt": "Suzhou classical garden pavilion in misty rain", "outputName": "suzhou_garden.png"},
  {"prompt": "Dunhuang Mogao Caves interior with flying apsaras murals", "outputName": "dunhuang_mogao.png"},
  {"prompt": "Guilin Li River karst mountains with bamboo raft", "outputName": "guilin_liriver.png"},
  {"prompt": "Chengdu Wide-Narrow Alley night scene with lanterns", "outputName": "chengdu_alley.png"},
  {"prompt": "Tibetan plateau yaks herd under snow mountains", "outputName": "tibet_plateau.png"}
]
```
