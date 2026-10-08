<template>
  <!-- 书架号选择组件，数据来源于字典 book_shelfs -->
  <el-select
    :value="value"
    :placeholder="placeholder"
    :clearable="clearable"
    :size="size"
    :disabled="disabled"
    @change="handleChange"
  >
    <el-option
      v-for="dict in dictOptions"
      :key="dict.value"
      :label="dict.label"
      :value="dict.value"
    >
      <span style="float: left">{{ dict.label }}</span>
      <span style="float: right; color: #8492a6; font-size: 13px">{{ dict.value }}</span>
    </el-option>
  </el-select>
</template>

<script>
export default {
  name: "ShelfCodeSelect",
  props: {
    // 选中的书架号
    value: {
      type: String,
      default: ""
    },
    // 占位文本
    placeholder: {
      type: String,
      default: "请选择书架号"
    },
    // 是否可清空
    clearable: {
      type: Boolean,
      default: true
    },
    // 尺寸
    size: {
      type: String,
      default: undefined
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    }
  },
  dicts: ['book_shelfs'],
  computed: {
    /** 字典选项 */
    dictOptions() {
      return (this.dict && this.dict.type && this.dict.type.book_shelfs) || []
    }
  },
  methods: {
    handleChange(val) {
      this.$emit("input", val)
      this.$emit("change", val)
    }
  }
}
</script>
