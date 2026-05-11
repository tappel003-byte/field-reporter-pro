I found the likely cause: the work screen listens to pointer events on the whole map/stage, and toolbar/menu touches can fall through into the map tap handler. That map tap handler currently drops a new pin and auto-clicks the hidden camera input, so unrelated controls can appear to open the camera.

Plan:
1. Stop map pointer handling when the tap starts on a real UI control, menu, sheet, toolbar, fullscreen button, or export controls.
2. Remove the automatic camera launch after dropping a new pin. Dropping a pin should open the pin sheet only; the camera should open only when the user taps Add photo.
3. Make Export and Draw tool buttons only perform their intended action and prevent their tap from being interpreted as a map tap.
4. Keep the three location options exactly as intended: type address manually, Auto-fill address, or Use coordinates.
5. Verify by checking the code paths: only the hidden photo input/Add photo button should trigger the camera file picker.