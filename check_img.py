from PIL import Image
import os

path = r'f:\Games\Survive\assets\swordsman\PNG\Swordsman_lvl1\Parts\Swordsman_lvl1_Run_body.png'
if os.path.exists(path):
    with Image.open(path) as img:
        print(f"Dimensions: {img.width}x{img.height}")
else:
    print("File not found")
