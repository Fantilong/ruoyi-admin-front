<template>
  <!-- 图书类目树选择组件，支持多选，选中值以逗号分隔 -->
  <treeselect
    :value="selectedIds"
    :options="categoryOptions"
    :normalizer="normalizer"
    :multiple="true"
    :flat="true"
    :show-count="true"
    value-consists-of="ALL"
    placeholder="请选择图书类目"
    no-results-text="未找到匹配的类目"
    @input="handleInput"
  />
</template>

<script>
import { listBookCategory } from "@/api/ssk/bookCategory";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "CategoryTreeSelect",
  components: { Treeselect },
  props: {
    // 选中的类目ID集，逗号分隔的字符串
    value: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      // 类目树选项
      categoryOptions: [],
    };
  },
  computed: {
    /**
     * 将逗号分隔的字符串转换为数字ID数组
     * treeselect多选模式下value必须为数组，且ID类型需与树节点id（数字）一致
     */
    selectedIds() {
      if (!this.value) {
        return [];
      }
      return this.value
        .split(",")
        .filter((id) => id !== "" && id !== null && id !== undefined)
        .map((id) => Number(id));
    },
  },
  created() {
    this.loadOptions();
  },
  methods: {
    /** 加载类目树 */
    loadOptions() {
      listBookCategory().then((response) => {
        this.categoryOptions = response.data || [];
      });
    },
    /** 转换树数据结构 */
    normalizer(node) {
      return {
        id: node.id,
        label: node.title,
        children:
          node.children && node.children.length > 0 ? node.children : undefined,
      };
    },
    /** 多选选中变化时，将数组转为逗号分隔字符串 */
    handleInput(val) {
      const str = Array.isArray(val) ? val.join(",") : val || "";
      this.$emit("input", str);
    },
    /** 刷新选项 */
    refresh() {
      this.loadOptions();
    },
  },
};
</script>
