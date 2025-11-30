import os

# Base directory for the project's data assets (this keeps paths portable)
BASE = os.path.join(os.path.dirname(__file__), "data")

# 1) Define Local Paths for qwen/image assets
bg_path = os.path.join(BASE, "bg.png")
img3_m = os.path.join(BASE, "male", "dress2.jpeg")
prompt_m = "A real half-body image of a man wearing a crisp white Emirati Kandura with the red, green, white, and black UAE National Day sash scarf featuring gold embroidery and the UAE emblem draped over his shoulders. The background is an illustration of Dubai skyline with Burj Khalifa and buildings in beige tones, UAE flag on left, sand dunes, blue sky with clouds and a logo on top right corner."


img3_f = os.path.join(BASE, "female", "dress.jpeg")
prompt_f = "A real half-body image of the woman wearing a black abaya with UAE flag colors embellished panel and beige hijab. The background is an illustration of Dubai skyline with Burj Khalifa and buildings in beige tones, UAE flag on left, sand dunes, blue sky with clouds and a logo on top right corner."


img3_b = os.path.join(BASE, "boy", "dress.jpg")
prompt_b = "A real half-body image of the boy wearing Emirati thobe showing his hand. The background is an illustration of Dubai skyline with Burj Khalifa and buildings in beige tones, UAE flag on left, sand dunes, blue sky with clouds and a logo on top right corner."

# The repository contains `data/girl/dress.jpeg` so use the `.jpeg` extension here
img3_g = os.path.join(BASE, "girl", "dress.jpeg")
prompt_g = "A real half-body image of the girl wearing a UAE flag colors dress. The background is an illustration of Dubai skyline with Burj Khalifa and buildings in beige tones, UAE flag on left, sand dunes, blue sky with clouds and a logo on top right corner."


# 2) Define Local Paths for wan (audio + prompts)
audio_m = os.path.join(BASE, "male", "audio1.mp3")
prompt_mw = "The Man is singing"

audio_f = os.path.join(BASE, "female", "audio1.mp3")
prompt_fw = "The woman is singing."

audio_b = os.path.join(BASE, "boy", "audio1.mp3")
prompt_bw = "The boy is singing."

audio_g = os.path.join(BASE, "girl", "audio1.mp3")
prompt_gw = "The girl is singing."

