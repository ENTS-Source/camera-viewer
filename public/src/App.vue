<template>
    <div id="app">
        <div class='flex-container'>
            <camera v-for="camera in cameras" v-bind:camera="camera"></camera>
        </div>
    </div>
</template>

<script>
import Camera from './components/Camera'
import Modal from './components/Modal'

export default {
  name: 'app',
  components: {
    Camera,
    Modal
  },
  data: () => ({
    cameras: []
  }),
  mounted: function() {
    this.$http.get("/api/v1/cameras").then(response => {
        this.cameras = response.body;
    }, errorResponse => {
        // TODO: Better error handling
        alert("Failed to load camera list - please try again later");
        console.error(errorResponse);
    });
  }
}
</script>

<style>
#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}

.flex-container {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: center;
    align-items: baseline;
    align-content: center;
}
</style>
