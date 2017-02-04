<template xmlns:v-bind="http://www.w3.org/1999/xhtml">
    <div class="camera-element">
        <img :src="uri" style="width: 100%; height: 100%" @click="maximize">
        <div class="name">
            {{ camera.friendlyName }}
        </div>
        <modal v-if="showModal" @close="minimize">
            <h3 slot="header">{{ camera.friendlyName }}</h3>
            <div slot="body">
                <img :src="uri" style="width: 1000px;" >
            </div>
            <div slot="footer"></div>
        </modal>
    </div>
</template>

<script>
import Modal from './Modal'
export default {
  name: 'camera',
  props: ['camera'],
  components: { Modal },
  data: () => ({
    uri: "",
    showModal: false,
  }),
  mounted: function() {
    var hash = "";
    var self = this;
    var updateImage = function(){
        self.$http.get("/api/v1/camera/" + self.camera.name + "/snapshot", { params: { lastHash: hash }}).then(response => {
            self.uri = "data:image/jpeg;base64," + response.body.image;
            hash = response.body.hash;
            setTimeout(updateImage, 500); // wait a little bit before trying the next request
        }, errorResponse => {
            console.error(errorResponse);
            setTimeout(updateImage, 5000); // wait a long time before trying the next request
        });
    };
    updateImage();
  },
  methods: {
    maximize: function(event) {
        this.showModal = true;
    },
    minimize: function(event) {
        this.showModal = false;
    }
  }
}
</script>

<style>
    .camera-element {
        max-width: 450px;
        margin: 5px;
        border: 1px solid #ccc;
    }

    .camera-element > img {
        cursor: pointer;
    }
</style>