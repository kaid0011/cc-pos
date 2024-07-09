<template>
  <div>
    <div>Model: {{ model }}</div>
    <div>Manufacturer: {{ manufacturer }}</div>
    <q-btn 
      dense 
      flat 
      class="bg-primary text-white rounded-borders" 
      icon="photo_camera"
      @click="openCamera">
    </q-btn>
    <div v-if="photo">
      <img :src="photo" alt="Captured Photo" />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { Device } from '@capacitor/device'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

export default {
  setup () {
    const model = ref('Please wait...')
    const manufacturer = ref('Please wait...')
    const photo = ref(null)

    onMounted(() => {
      Device.getInfo().then(info => {
        model.value = info.model
        manufacturer.value = info.manufacturer
      })
    })

    const openCamera = async () => {
      try {
        const capturedPhoto = await Camera.getPhoto({
          resultType: CameraResultType.Uri,
          source: CameraSource.Camera,
          quality: 90
        })
        photo.value = capturedPhoto.webPath
      } catch (error) {
        console.error('Error opening camera:', error)
      }
    }

    return {
      model,
      manufacturer,
      photo,
      openCamera
    }
  }
}
</script>
