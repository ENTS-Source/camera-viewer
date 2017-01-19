<template xmlns:v-bind="http://www.w3.org/1999/xhtml">
    <img :src="uri">
</template>

<script>
export default {
  name: 'camera',
  props: ['uri']
}
</script>