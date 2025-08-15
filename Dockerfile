# 步骤 1: 使用轻量的 slim 基础镜像
FROM python:3.13-slim

# 设置工作目录
WORKDIR /app

# 步骤 2: 安装 uv
# 我们将 pip 本身升级一下，然后用它来安装 uv
RUN pip install --upgrade pip && pip install uv

# 步骤 3: 复制依赖定义文件
# 复制 pyproject.toml 和 requirements.txt (如果存在)
COPY pyproject.toml* requirements.txt* ./

# 步骤 4: 使用 uv 安装 Python 依赖
# --system 标志告诉 uv 将包装安装到全局 site-packages 中，这在 Docker 中是推荐的做法
RUN uv pip sync --system

# 步骤 5: 复制项目代码
COPY . .

# 步骤 6: 设置容器的默认启动命令
# 直接启动 FastAPI 应用，而不是通过 shell 脚本
CMD ["python", "web.py"]
