<template>
  <div class="book-image-upload">
    <!-- 图片列表 + 上传按钮，支持拖拽排序 -->
    <draggable
      v-model="imageList"
      class="image-list-drag"
      @end="handleDragEnd"
      :disabled="disabled"
    >
      <!-- 已上传图片项 -->
      <div
        v-for="(item, index) in imageList"
        :key="item.uid"
        class="image-item"
      >
        <img :src="item.url" class="image-content" />
        <!-- 首张标记为封面 -->
        <span v-if="index === 0" class="cover-badge">封面</span>
        <!-- 删除按钮 -->
        <span v-if="!disabled" class="image-actions">
          <i class="el-icon-delete" @click="handleRemove(index)"></i>
        </span>
      </div>
    </draggable>

    <!-- 上传按钮，放在最后，满5张后隐藏 -->
    <el-upload
      v-if="!disabled && imageList.length < limit"
      :action="uploadUrl"
      :headers="headers"
      :show-file-list="false"
      :before-upload="handleBeforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      accept="image/png,image/jpeg,image/jpg"
      class="image-uploader"
    >
      <i class="el-icon-plus image-uploader-icon"></i>
    </el-upload>

    <!-- 提示文字 -->
    <div v-if="!disabled" class="upload-tip">
      最多上传{{ limit }}张，每张不超过{{ fileSize }}MB，支持拖拽调整顺序，第一张图为封面图
    </div>

    <!-- 图片预览 -->
    <el-dialog :visible.sync="previewVisible" append-to-body title="图片预览" width="800px">
      <img :src="previewUrl" style="display:block;max-width:100%;margin:0 auto;" />
    </el-dialog>
  </div>
</template>

<script>
import { getToken } from "@/utils/auth"
import draggable from "vuedraggable"

export default {
  name: "BookImageUpload",
  components: { draggable },
  props: {
    // 图片集，逗号分隔的字符串URL
    value: {
      type: String,
      default: ""
    },
    // 最大上传数量
    limit: {
      type: Number,
      default: 5
    },
    // 单张大小限制（MB）
    fileSize: {
      type: Number,
      default: 5
    },
    // 是否禁用（仅查看）
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      baseUrl: process.env.VUE_APP_BASE_API,
      uploadUrl: process.env.VUE_APP_BASE_API + "/common/upload",
      headers: { Authorization: "Bearer " + getToken() },
      // 图片列表
      imageList: [],
      previewVisible: false,
      previewUrl: ""
    }
  },
  watch: {
    value: {
      handler(val) {
        if (val && val !== this.innerValue) {
          this.imageList = val.split(",").filter(Boolean).map((url, i) => ({
            uid: Date.now() + i,
            url: this.resolveUrl(url)
          }))
        } else if (!val) {
          this.imageList = []
        }
      },
      immediate: true
    }
  },
  methods: {
    /** 拼接完整图片URL */
    resolveUrl(url) {
      if (!url) return ""
      if (url.startsWith("http")) return url
      return this.baseUrl + url
    },
    /** 上传前校验 */
    handleBeforeUpload(file) {
      // 校验文件类型
      const isImage = ["image/jpeg", "image/png", "image/jpg"].includes(file.type)
      if (!isImage) {
        this.$modal.msgError("只能上传 JPG/PNG 格式的图片")
        return false
      }
      // 校验文件大小
      const isLt = file.size / 1024 / 1024 < this.fileSize
      if (!isLt) {
        this.$modal.msgError(`图片大小不能超过 ${this.fileSize}MB`)
        return false
      }
      // 校验数量
      if (this.imageList.length >= this.limit) {
        this.$modal.msgError(`最多只能上传 ${this.limit} 张图片`)
        return false
      }
      this.$modal.loading("正在上传图片，请稍候...")
    },
    /** 上传成功 */
    handleSuccess(res, file) {
      this.$modal.closeLoading()
      if (res.code === 200) {
        this.imageList.push({
          uid: Date.now(),
          url: this.baseUrl + res.fileName
        })
        this.emitValue()
      } else {
        this.$modal.msgError(res.msg || "上传失败")
      }
    },
    /** 上传失败 */
    handleError() {
      this.$modal.closeLoading()
      this.$modal.msgError("上传图片失败，请重试")
    },
    /** 删除图片 */
    handleRemove(index) {
      this.imageList.splice(index, 1)
      this.emitValue()
    },
    /** 拖拽排序结束 */
    handleDragEnd() {
      this.emitValue()
    },
    /** 输出值：将图片URL转为逗号分隔的字符串（去掉baseUrl前缀） */
    emitValue() {
      const urls = this.imageList.map(item => {
        return item.url.replace(this.baseUrl, "")
      })
      this.innerValue = urls.join(",")
      this.$emit("input", this.innerValue)
      this.$emit("change", this.innerValue)
    }
  }
}
</script>

<style scoped lang="scss">
.book-image-upload {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}

/* 图片列表容器 */
.image-list-drag {
  display: flex;
  flex-wrap: wrap;
}

/* 图片项：正方形占位 */
.image-item {
  position: relative;
  width: 120px;
  height: 120px;
  margin-right: 10px;
  margin-bottom: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  overflow: hidden;
  cursor: move;
}

/* 图片内容：完全展示，不裁剪 */
.image-content {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* 封面标记 */
.cover-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  background: #409eff;
  color: #fff;
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 3px;
}

/* 删除按钮 */
.image-actions {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 16px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-item:hover .image-actions {
  opacity: 1;
}

/* 上传按钮：与图片项同等大小 */
.image-uploader {
  display: inline-block;
}

.image-uploader ::v-deep .el-upload {
  width: 120px;
  height: 120px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-right: 10px;
  margin-bottom: 10px;
}

.image-uploader ::v-deep .el-upload:hover {
  border-color: #409eff;
}

.image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

/* 提示文字 */
.upload-tip {
  width: 100%;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.5;
}
</style>
