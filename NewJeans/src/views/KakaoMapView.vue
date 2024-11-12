<script setup>
import { onMounted, watch, nextTick, ref } from 'vue';

const props = defineProps({
  latitude: Number,
  longitude: Number,
  mapId: String,  // 지도의 고유 ID를 받아오는 props 추가
});

let map;
let marker;
const mapContainer = ref(null); // map 요소에 대한 참조
const address = ref(''); // 주소 변수 추가

const initMap = () => {
  if (!mapContainer.value) return;

  const options = {
    center: new kakao.maps.LatLng(props.latitude, props.longitude),
    level: 3,
  };
  map = new kakao.maps.Map(mapContainer.value, options);

  if (marker) {
    marker.setMap(null);
  }

  const markerPosition = new kakao.maps.LatLng(props.latitude, props.longitude);
  marker = new kakao.maps.Marker({
    position: markerPosition,
  });

  marker.setMap(map);

  // 주소 변환 및 업데이트
  const geocoder = new kakao.maps.services.Geocoder();
  geocoder.coord2Address(markerPosition.getLng(), markerPosition.getLat(), (result, status) => {
    if (status === kakao.maps.services.Status.OK) {
      address.value = result[0].address.address_name;
    }
  });
};

onMounted(async () => {
  await nextTick();
  initMap();
});

watch(
  () => [props.latitude, props.longitude],
  async () => {
    await nextTick();
    initMap();
  },
);

</script>

<template>
  <!-- 각 지도 컴포넌트가 mapId를 통해 고유한 ref를 갖도록 설정 -->
  <div :id="props.mapId" ref="mapContainer" style="width: 100%; height: 300px;"></div>
  
  <!-- 주소 표시 영역 추가 -->
  <div v-if="address" class="addressPreview">
    <strong>{{ address }}</strong>
  </div>
</template>

<style scoped>
#map {
  width: 100%;
  height: 300px;
}
.addressPreview {
  margin-top: 10px;
  padding: 10px;
  font-size: 14px;
  color: #333;
  background-color: #f9f9f9; /* 연한 배경색 추가 */
  border: 1px solid #ddd; /* 경계선 추가 */
  border-radius: 5px; /* 둥근 모서리 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* 약간의 그림자 효과 */
  display: flex;
  align-items: center;
  gap: 8px; /* 아이콘과 텍스트 사이의 간격 */
}

.addressPreview::before {
  content: '🚩'; /* 위치 아이콘을 주소 앞에 추가 */
  font-size: 16px;
  color: #ff6347; /* 위치 아이콘 색상 */
}


</style>
