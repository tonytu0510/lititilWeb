from rembg import remove
from PIL import Image
import os

input_folder = 'E:/lititil/lititilWeb'
output_folder = 'E:/lititil/lititilWeb/indexCanvas/output'

if not os.path.exists(output_folder):
    os.makedirs(output_folder)

for filename in os.listdir(input_folder):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        input_path = os.path.join(input_folder, filename)
        output_path = os.path.join(output_folder, f"removed_bg_{filename}.png")

        print(f"正在抠图处理: {filename} ...")
        
        input_image = Image.open(input_path)
        
        output_image = remove(input_image)

        output_image.save(output_path)
        print(f"✅ 抠图完成，已保存至: {output_path}")

print("所有图片处理完毕！")