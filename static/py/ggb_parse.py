import zipfile
import xmltodict
import os
import io
# 获取当前目录
current_directory = os.getcwd()

path = os.path.join(current_directory, 'static', 'py', 'geogebra-export.ggb')
def bytes_parse(bytes):
    """
    将上传的zip文件字节流转换为ZipFile对象
    :param zip_bytes: 上传文件的字节数据
    :return: zipfile.ZipFile 对象
    """
    try:
        # 将字节数据转换为内存文件对象
        zip_stream = io.BytesIO(bytes)
        
        # 创建ZipFile对象
        zip_file = zipfile.ZipFile(zip_stream, 'r')
        return zip_file
    except zipfile.BadZipFile:
        raise Exception("上传的文件不是有效的ZIP文件")
    except Exception as e:
        raise Exception(f"解析ZIP文件失败: {str(e)}")

def zip_parse(zip_file, file):
    if file not in zip_file.namelist():
        raise Exception(f'{file} not find')
    container = zip_file.read(file)
    return container

def xml_parse(file):
    dict_data = xmltodict.parse(file)
    return dict_data

if __name__ == "__main__":
    with zipfile.ZipFile(path, 'r') as zip_ref:
        file = zip_parse(zip_ref, 'geogebra.xml')
    dict_data = xml_parse(file)
    print(dict_data)