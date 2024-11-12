<template>
  <div class="team-view">
    <!-- 상단: 친구 검색, 친구 요청, 교환일기 요청 -->
    <div class="top-section">
      <!-- 친구 검색 섹션 -->
      <div class="friend-search-container">
        <h3>친구 검색</h3>
        <div class="friend-search">
          <input class="search-input" v-model="searchQuery" placeholder="닉네임으로 검색하기" @input="searchFriends" />
          <div v-if="searchResults.length > 0" class="search-results">
            <div v-for="user in searchResults" :key="user.idx" class="search-result-item">
              <img :src="user.profileImageUrl || defaultProfileImage" class="profile-icon" />
              <span class="user-click">{{ user.userName }}</span>
              <span class="friend-email">{{ user.email }}</span>
              <button @click="sendFriendRequest(user.userId)">친구 추가 요청</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 친구 요청 섹션 -->
      <div class="friend-request-container">
        <h3>친구 요청</h3>
        <div class="notification-section">
          <div class="request-notification" @click="toggleRequestList">
            <span class="notification-message">새로운 친구 요청 확인</span>
            <div v-if="friendRequests.length > 0" class="notification-badge">
              {{ friendRequests.length }}
            </div>
          </div>
          <transition name="fade">
            <ul v-if="showRequestList" class="request-list">
              <li v-for="request in friendRequests" :key="request.userId" class="search-result-item">
                <img :src="request.profileImageUrl || defaultProfileImage" alt="프로필 이미지" class="profile-icon" />
                <span class="user-click">{{ request.userName }}</span>
                <span class="friend-email">{{ request.email }}</span>
                <button @click="acceptFriendRequest(request.userId)">수락</button>
                <button class="delete-button-ex" @click="rejectFriendRequest(request.userId)">거절</button>
              </li>
            </ul>
          </transition>
        </div>
      </div>

      <!-- 교환일기 요청 섹션 -->
      <div class="exchange-diary-request-container">
        <h3>교환일기 요청</h3>
        <div class="notification-section">
          <div class="request-notification" @click="toggleExchangeDiaryRequestList">
            <span class="notification-message">새로운 교환일기 요청 확인</span>
            <div v-if="exchangeDiaryRequests.length > 0" class="notification-badge">
              {{ exchangeDiaryRequests.length }}
            </div>
          </div>
          <transition name="fade">
            <ul v-if="showExchangeDiaryRequestList" class="request-list">
              <li v-for="request in exchangeDiaryRequests" :key="request.diaryId" class="search-result-item">
                <img :src="request.profileImageUrl" alt="프로필 이미지" class="profile-icon" />
                <span class="user-click">{{ request.userName }}</span>
                <span class="friend-email">{{ request.email }}</span>
                <button @click="acceptExchangeDiaryRequest(request.diaryId, request.userId, userId)">수락</button>
                <button class="delete-button-ex" @click="rejectExchangeDiaryRequest(request.diaryId)">거절</button>
              </li>
            </ul>
          </transition>
        </div>
      </div>
    </div>

    <!-- 중간: 친구 목록 및 교환 일기 목록 -->
    <div class="middle-section">
      <!-- 친구 목록 섹션 -->
      <div class="friend-list-container">
        <h3>나의 친구 목록</h3>
        <div class="friends-list">
          <ul class="f-list" style="padding: 0">
            <li v-for="friend in friends" :key="friend.idx" class="search-result-item-4">
              <img :src="friend.profileImageUrl || defaultProfileImage" alt="프로필 이미지" class="profile-icon" />
              <span class="user-click">{{ friend.userName }}</span>
              <span class="friend-email">{{ friend.email }}</span>
              <button class="delete-button-4">친구 삭제</button>
            </li>
          </ul>
        </div>
      </div>

      <!-- 내 교환일기 목록 섹션 -->
      <div class="my-exchange-diary-container">
        <h3>내 교환 일기 목록</h3>
        <ul class="exchange-diary-list">
          <li v-for="diary in exchangeDiaries" :key="diary.diaryId" class="exchange-diary-item">
            <h4 @click="toggleDiaryEntries(diary.diaryId)">교환 일기: {{ diary.groupName }}</h4>
            <button class="delete-button-ex" @click="deleteExchangeDiary(diary.diaryId)">교환 관계 끊기</button>
            <button @click="openEntryModal(diary.diaryId)">일기 쓰기</button>
            <ul v-if="openDiaryId === diary.diaryId">
              <li v-for="entry in diary.entries" :key="entry.entryId" class="entry-item">
                <p><strong>제목:</strong> {{ entry.title }}</p>
                <p><strong>내용:</strong> {{ entry.content }}</p>
                <small>
                  <strong>작성자:</strong> {{ entry.authorName }} | <strong>작성일:</strong> {{ new Date(entry.createdAt).toLocaleString() }}
                  <button @click="openUpdateEntryModal(entry)">수정</button>
                  <button @click="deleteExchangeDiaryEntry(entry.entryId)">삭제</button>
                </small>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>

    <!-- 하단: 교환일기 신청 -->
    <div class="exchange-diary-apply-container">
      <h3>교환일기 신청</h3>
      <button class="request-exchange-button" @click="isCreateModalOpen = true">교환일기 신청하기</button>
    </div>

    <!-- 일기 작성 모달 -->
    <div v-if="isEntryModalOpen" class="modal-overlay">
      <div class="modal">
        <h3>새 일기 작성</h3>
        <input v-model="entryTitle" placeholder="제목을 입력하세요" />
        <textarea v-model="entryContent" placeholder="내용을 입력하세요"></textarea>
        <button @click="submitEntry">작성 완료</button>
        <button @click="closeEntryModal">취소</button>
      </div>
    </div>

    <!-- 교환일기 신청 모달 -->
    <div v-if="isCreateModalOpen" class="modal-overlay">
      <div class="modal">
        <h3>교환일기 신청</h3>
        <input v-model="groupName" placeholder="그룹명을 입력하세요" />
        <div class="friend-dropdown">
          <h4>친구 목록</h4>
          <ul class="friend-list-dropdown">
            <li v-for="friend in friends" :key="friend.idx" class="search-result-item-1">
              <img :src="friend.profileImageUrl || defaultProfileImage" class="profile-icon" />
              <span class="user-click">{{ friend.userName }}</span>
              <button @click="selectFriend(friend)">초대</button>
            </li>
          </ul>
        </div>
        <div v-if="selectedFriend" class="invited-list">
          <h4>초대된 친구</h4>
          <div class="search-result-item">
            <img :src="selectedFriend.profileImageUrl || defaultProfileImage" class="profile-icon" />
            <span class="user-click">{{ selectedFriend.userName }}</span>
          </div>
        </div>
        <button @click="sendExchangeDiaryRequest">신청하기</button>
        <button @click="isCreateModalOpen = false">취소</button>
      </div>
    </div>

    <!-- 일기 수정 모달 -->
    <transition name="modal">
      <div class="modal-overlay" v-if="isUpdateModalOpen" @click.self="closeUpdateModal">
        <div class="modal-content">
          <h3>일기 수정</h3>
          <div class="entry-title-input">
            <label for="entry-title">제목:</label>
            <input id="entry-title" type="text" v-model="entryTitle" placeholder="제목을 입력하세요" />
          </div>
          <div class="entry-content-input">
            <label for="entry-content">내용:</label>
            <textarea id="entry-content" v-model="entryContent" placeholder="내용을 입력하세요"></textarea>
          </div>
          <div class="modal-buttons">
            <button @click="submitEntryUpdate">수정 완료</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { BASE_URL } from '@/config';
import defaultProfileImage from '@/assets/profile2.jpg';
import { useAuthStore } from '@/stores/authStore';

// AuthStore에서 현재 로그인한 사용자 ID 가져오기
const authStore = useAuthStore();
const userId = authStore.idx;

// 상태 변수들
const friends = ref([]); // 친구 목록
const friendRequests = ref([]); // 친구 요청 목록
const exchangeDiaryRequests = ref([]); // 교환일기 요청 목록
const searchQuery = ref(''); // 검색어
const searchResults = ref([]); // 검색 결과
const selectedFriend = ref(null); // 선택된 친구
const showRequestList = ref(false); // 친구 요청 목록 표시 여부
const showExchangeDiaryRequestList = ref(false); // 교환일기 요청 목록 표시 여부
const isModalOpen = ref(false); // 모달 창 열림 상태
const isUpdateModalOpen = ref(false); // 수정 모달 열림 상태 추가
const isCreateModalOpen = ref(false); // 생성 모달 열림 상태 추가
const exchangeDiaries = ref([]); // 교환 일기 목록
const openDiaryId = ref(null); // 열려 있는 일기의 ID
const groupName = ref(''); // 그룹명 상태 추가
const isEntryModalOpen = ref(false); // 일기 쓰기 모달 열림 상태
const entryTitle = ref(''); // 일기 제목
const entryContent = ref(''); // 일기 내용
const selectedDiaryId = ref(null); // 선택한 다이어리 ID
const entryId = ref(null); // 수정할 일기 ID

// 일기 쓰기 모달 열기
const openEntryModal = diaryId => {
  console.log('diaryId:', diaryId); // 전달된 diaryId 값 확인
  if (!diaryId) {
    alert('유효하지 않은 다이어리 ID입니다.');
    return;
  }
  selectedDiaryId.value = diaryId;
  isEntryModalOpen.value = true;
};

// 참가자 포맷 함수
const formatParticipants = participants => {
  if (participants.length === 1) return participants[0];
  return `${participants.slice(0, -1).join(', ')}와 ${participants[participants.length - 1]}`;
};

// 모달 닫기
const closeEntryModal = () => {
  isEntryModalOpen.value = false;
  entryTitle.value = '';
  entryContent.value = '';
  selectedDiaryId.value = null;
};

// 생성 요청 전송 함수
const submitEntry = async () => {
  if (!entryTitle.value.trim()) {
    alert('제목을 입력해야 합니다.');
    return; // 제목이 비어 있으면 함수 종료
  }

  try {
    const response = await axios.post(`${BASE_URL}/exchange-diary-entry/create`, {
      diaryId: selectedDiaryId.value,
      userId: userId,
      title: entryTitle.value,
      content: entryContent.value,
    });
    alert(response.data); // 작성 성공 메시지
    closeCreateModal(); // 모달 닫기
  } catch (error) {
    console.error('Failed to submit entry:', error);
    alert('일기 작성에 실패했습니다.');
  }
};

// 모달 관련 함수들
const openModal = () => {
  isModalOpen.value = true;
};

// 수정 모달 열기
const openUpdateEntryModal = entry => {
  entryId.value = entry.entryId;
  entryTitle.value = entry.title;
  entryContent.value = entry.content;
  isUpdateModalOpen.value = true; // 수정 모달 열기
};

// 수정 모달 닫기
const closeUpdateModal = () => {
  isUpdateModalOpen.value = false;
  entryTitle.value = '';
  entryContent.value = '';
  entryId.value = null;
};

// 생성 모달 닫기
const closeCreateModal = () => {
  isCreateModalOpen.value = false;
  entryTitle.value = '';
  entryContent.value = '';
  selectedDiaryId.value = null;
};

// 생성 모달 열기
const openCreateEntryModal = diaryId => {
  selectedDiaryId.value = diaryId;
  isCreateModalOpen.value = true; // 생성 모달 열기
};

// 수정 요청 전송 함수
const submitEntryUpdate = async () => {
  try {
    // 로그로 요청 데이터 확인
    console.log('Update Request Data:', {
      entryId: entryId.value,
      title: entryTitle.value,
      content: entryContent.value,
      userId: userId,
    });

    const response = await axios.post(`${BASE_URL}/exchange-diary-entry/update`, {
      entryId: entryId.value,
      title: entryTitle.value,
      content: entryContent.value,
      userId: userId,
    });
    exchangeDiaries.value = exchangeDiaries.value.map(diary => {
      if (diary.diaryId === openDiaryId.value) {
        return {
          ...diary,
          entries: diary.entries.map(entry => (entry.entryId === entryId.value ? { ...entry, title: entryTitle.value, content: entryContent.value } : entry)),
        };
      }
      return diary;
    });

    alert('일기가 성공적으로 수정되었습니다.');
    closeUpdateModal();
  } catch (error) {
    console.error('Failed to update diary entry:', error);
    alert('일기 수정에 실패했습니다.');
  }
};

// 엔트리 목록을 가져오는 함수
const fetchDiaryEntries = async diaryId => {
  try {
    const response = await axios.get(`${BASE_URL}/exchange-diary-entry/exchangeDiaryList/${diaryId}`, {
      params: { userId: userId }, // 추가된 userId 전달
    });
    const diary = exchangeDiaries.value.find(d => d.diaryId === diaryId);
    diary.entries = response.data;
  } catch (error) {
    console.error('Failed to load diary entries:', error);
  }
};

// 페이지 로드 시 교환일기 목록을 불러오는 함수
const loadExchangeDiaries = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/exchange-diary-entry/summary/${userId}`);
    exchangeDiaries.value = response.data.map(diary => ({
      ...diary,
      diaryId: diary.diaryId || diary.idx, // 일관성 유지
    }));
  } catch (error) {
    console.error('Failed to load exchange diaries:', error);
  }
};

// 엔트리 목록을 토글하는 함수 (팀 이름 클릭 시 호출)
const toggleDiaryEntries = diaryId => {
  if (openDiaryId.value === diaryId) {
    openDiaryId.value = null; // 현재 열려있는 항목을 닫음
  } else {
    openDiaryId.value = diaryId; // 새 항목을 열고 엔트리 로드
    fetchDiaryEntries(diaryId);
  }
};

// 친구 목록 불러오기
const loadFriends = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/friend/${userId}/list`);
    friends.value = await Promise.all(
      response.data.map(async friend => {
        const profileImageUrl = await loadProfileImage(friend.idx);
        return { ...friend, profileImageUrl };
      }),
    );
  } catch (error) {
    console.error('Failed to load friends:', error);
  }
};

// 프로필 이미지 불러오기 함수
const loadProfileImage = async userId => {
  try {
    const response = await axios.get(`${BASE_URL}/user/${userId}/profileImage`);
    let imageUrl = response.data;

    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `${BASE_URL}${imageUrl}`;
    }

    return imageUrl;
  } catch (error) {
    console.error(`Failed to load profile image for userId ${userId}:`, error);
    return defaultProfileImage;
  }
};

// 친구 요청 목록 불러오기
const loadFriendRequests = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/friend/${userId}/requests`);
    friendRequests.value = await Promise.all(
      response.data.map(async request => {
        const profileImageUrl = await loadProfileImage(request.idx);
        return { ...request, profileImageUrl };
      }),
    );
  } catch (error) {
    console.error('Failed to load friend requests:', error);
  }
};

// 교환일기 요청 목록 불러오기
const loadExchangeDiaryRequests = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/exchange-diary/${userId}/requests`);
    exchangeDiaryRequests.value = await Promise.all(
      response.data.map(async request => {
        const profileImageUrl = await loadProfileImage(request.idx);
        return { ...request, profileImageUrl };
      }),
    );
  } catch (error) {
    console.error('Failed to load exchange diary requests:', error);
  }
};

// 친구 요청 목록 토글
const toggleRequestList = () => {
  showRequestList.value = !showRequestList.value;
};

// 교환일기 요청 목록 토글
const toggleExchangeDiaryRequestList = () => {
  showExchangeDiaryRequestList.value = !showExchangeDiaryRequestList.value;
};

// 친구 요청 수락
const acceptFriendRequest = async requesterId => {
  try {
    await axios.post(`${BASE_URL}/friend/accept`, null, {
      params: {
        requesterId,
        receiverId: userId,
      },
    });
    friendRequests.value = friendRequests.value.filter(request => request.idx !== requesterId);
    await loadFriends();
    alert('친구 요청을 수락했습니다.');
  } catch (error) {
    console.error('Failed to accept friend request:', error);
    alert('친구 요청 수락에 실패했습니다.');
  }
};

// 친구 요청 거절 함수
const rejectFriendRequest = async friendRequestId => {
  try {
    await axios.post(`${BASE_URL}/friend/reject`, null, {
      params: { rejectedRequestId: friendRequestId },
    });
    friendRequests.value = friendRequests.value.filter(request => request.userId !== friendRequestId);
    alert('친구 요청을 거절했습니다.');
  } catch (error) {
    console.error('Failed to reject friend request:', error);
    alert('친구 요청 거절에 실패했습니다.');
  }
};

// 교환일기 요청 수락
const acceptExchangeDiaryRequest = async (diaryId, requesterId, receiverId) => {
  if (!diaryId) {
    alert('유효하지 않은 다이어리 ID입니다.');
    return;
  }

  try {
    await axios.post(`${BASE_URL}/exchange-diary/accept`, null, {
      params: {
        diaryId,
        requesterId,
        receiverId,
      },
    });
    exchangeDiaryRequests.value = exchangeDiaryRequests.value.filter(request => request.diaryId !== diaryId);
    alert('교환일기 요청을 수락했습니다.');
  } catch (error) {
    console.error('Failed to accept exchange diary request:', error);
    alert('교환일기 요청 수락에 실패했습니다.');
  }
};

// 교환일기 요청 거절
const rejectExchangeDiaryRequest = async exchangeDiaryId => {
  try {
    await axios.post(`${BASE_URL}/exchange-diary/reject`, null, {
      params: { exchangeDiaryId },
    });
    exchangeDiaryRequests.value = exchangeDiaryRequests.value.filter(request => request.diaryId !== exchangeDiaryId);
    alert('교환일기 요청을 거절했습니다.');
  } catch (error) {
    console.error('Failed to reject exchange diary request:', error);
    alert('교환일기 요청 거절에 실패했습니다.');
  }
};

// 교환 일기 삭제
const deleteExchangeDiary = async exchangeDiaryId => {
  try {
    await axios.delete(`${BASE_URL}/exchange-diary/${exchangeDiaryId}`);
    exchangeDiaries.value = exchangeDiaries.value.filter(diary => diary.diaryId !== exchangeDiaryId);
    alert('교환일기가 성공적으로 삭제되었습니다.');
  } catch (error) {
    console.error('Failed to delete exchange diary:', error);
    alert('교환일기 삭제에 실패했습니다.');
  }
};

// 일기 엔트리 삭제
const deleteExchangeDiaryEntry = async entryId => {
  try {
    await axios.delete(`${BASE_URL}/exchange-diary-entry/delete/${entryId}`);
    // 삭제된 엔트리를 화면에서 즉시 제거
    exchangeDiaries.value = exchangeDiaries.value.map(diary => {
      if (diary.diaryId === openDiaryId.value) {
        return {
          ...diary,
          entries: diary.entries.filter(entry => entry.entryId !== entryId),
        };
      }
      return diary;
    });
    alert('일기가 성공적으로 삭제되었습니다.');
  } catch (error) {
    console.error('Failed to delete diary entry:', error);
    alert('일기 삭제에 실패했습니다.');
  }
};

//친구 검색
const searchFriends = async () => {
  try {
    if (searchQuery.value.trim()) {
      const response = await axios.get(`${BASE_URL}/friend/search`, {
        params: { userId: userId, userName: searchQuery.value },
      });
      console.log('API Response Data:', response.data); // 응답 데이터 구조 확인
      searchResults.value = await Promise.all(
        response.data.map(async user => {
          console.log('5811111 = ' + JSON.stringify(user));
          //const profileImageUrl = await loadProfileImage(user.idx);
          const profileImageUrl = `${BASE_URL}${user.profileImageUrl}`;
          console.log(profileImageUrl);
          return { ...user, profileImageUrl };
        }),
      );
      console.log('Mapped searchResults Data:', searchResults.value); // 매핑 후 결과 확인
    } else {
      searchResults.value = [];
    }
  } catch (error) {
    console.error('Failed to search friends:', error);
  }
};

// 친구 추가 요청 보내기
const sendFriendRequest = async receiverId => {
  console.log('Attempting to add friend with receiverId:', receiverId); // receiverId가 올바르게 표시되는지 확인
  console.log('User object:', userId); // requesterId인 userId가 올바르게 표시되는지 확인
  try {
    await axios.post(`${BASE_URL}/friend/request`, null, {
      params: {
        requesterId: userId,
        receiverId,
      },
    });
    alert('친구 요청이 성공적으로 전송되었습니다.');
  } catch (error) {
    console.error('Failed to send friend request:', error);
    alert('친구 요청 전송에 실패했습니다.');
  }
};

// 친구 선택 함수 (한 명만 선택 가능)
const selectFriend = friend => {
  selectedFriend.value = friend; // 선택한 친구로 업데이트
};

/// 교환일기 요청 보내기
const sendExchangeDiaryRequest = async () => {
  if (!groupName.value.trim()) {
    alert('그룹명을 입력해야 합니다.');
    return; // 제목이 비어 있으면 함수 종료
  }

  try {
    const response = await axios.post(`${BASE_URL}/exchange-diary/request`, null, {
      params: {
        requesterId: userId,
        receiverId: selectedFriend.value.idx,
        groupName: groupName.value,
      },
    });
    const diaryId = response.data; // 백엔드에서 반환된 다이어리 ID 저장
    alert(`교환일기 신청이 성공적으로 전송되었습니다. Diary ID: ${diaryId}`);

    // 요청 후 교환 일기 목록을 업데이트할 때 diaryId도 포함해서 저장
    exchangeDiaryRequests.value.push({
      diaryId,
      userId: selectedFriend.value.idx,
      userName: selectedFriend.value.userName,
      profileImageUrl: selectedFriend.value.profileImageUrl,
    });
  } catch (error) {
    console.error('Failed to send exchange diary request:', error);
    alert('교환일기 신청에 실패했습니다.');
  }
};
// 컴포넌트가 로드될 때 친구 목록 및 요청 목록 가져오기
onMounted(async () => {
  await loadFriends();
  await loadFriendRequests();
  await loadExchangeDiaries();
  await loadExchangeDiaryRequests();
  console.log(exchangeDiaries.value); // 데이터 로드 확인용 로그
});
</script>

<style scoped>
.team-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 12px;
  max-width: 100vh;
  margin-left: 5vh;
  height: 83vh;
  /* 기본 높이 설정 대신 콘텐츠에 맞게 조정되도록 설정 */
}

.friend-request-container,
.exchange-diary-request-container,
.friend-list-container,
.friend-search-container,
.exchange-diary-apply-container,
.my-exchange-diary-container {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.my-exchange-diary-container {
  width: 61vh;
  position: absolute; /* 절대 위치로 설정 */
  z-index: 2; /* 다른 요소 위로 표시되도록 설정 */
  top: 0; /* 부모 요소 기준으로 위쪽 위치 */
  right: 0vh; /* 부모 요소 기준으로 오른쪽 위치 */
  height: 538px;
  max-height: 600px; /* 원하는 높이 값 */
  overflow: auto; /* 내용이 많아질 경우 스크롤 가능 */
  background-color: #ffffff; /* 배경색 추가 */
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 그림자 강조 */
}

.exchange-diary-request-container {
  width: 32vh;
}

.exchange-diary-apply-container {
  width: 32vh;
}

.friend-request-container {
  width: 26vh;
}

.friend-search-container {
  width: 30vh;
}

.exchange-diary-apply-container {
  width: 28.5vh;
}

input.search-input {
  width: 95%; /* input 검색창의 넓이를 95%로 설정 */
}

.friend-list-container {
  width: 28.5vh;
  z-index: 1; /* 기본값으로 두어 교환 일기 목록이 위에 표시되도록 설정 */
}

/* 엔트리 항목 스타일 추가 */
.entry-item {
  margin-top: 10px;
  list-style: none;
  background-color: #f1f5f9;
  border-radius: 8px;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #d1d5db;
}

.entry-item p {
  margin: 5px 0;
  font-size: 0.95rem;
}

.entry-item button:hover {
  background-color: #1f2937; /* 호버 시 버튼 색상 변경 */
}

.entry-item button {
  background-color: #333333; /* 버튼 색상 */
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  margin-left: 5px;
}

.friend-request-container:hover,
.exchange-diary-request-container:hover,
.friend-list-container:hover,
.friend-search-container:hover,
.exchange-diary-apply-container:hover,
.my-exchange-diary-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

h3 {
  text-align: center;
  font-size: 1.5rem;
  color: #333;
  border-bottom: 2px solid #3b82f6;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.notification-section,
.friends-list,
.friend-search,
.exchange-diary-list {
  display: flex;
  flex-direction: column;
  padding: 0;
}

.request-notification {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #333;
  color: white;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background-color 0.3s;
}

.request-notification:hover {
  background-color: #ddd;
}

.notification-badge {
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: bold;
}

.profile-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
}

.search-result-item {
  background-color: #f1f5f9;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  overflow: hidden;
  display: table; /* 테이블 레이아웃 사용 */
  width: 94%;
}

.search-result-item img {
  display: table-cell;
  vertical-align: top;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
}

.search-result-item .user-info {
  display: table-cell;
  vertical-align: top;
}

.search-result-item .user-click {
  display: block;
  font-size: 1rem;
  margin-bottom: 5px;
  font-weight: bold;
}

.search-result-item .friend-email {
  display: block;
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 10px;
}

.search-result-item .button-group {
  display: block;
}

.search-result-item button {
  background-color: #333;
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-right: 5px;
}

.search-result-item button:hover {
  background-color: #ddd;
}

.search-result-item-4 {
  background-color: #f1f5f9;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  overflow: hidden;
  display: block;
  width: 94%;
  height: 55px;
}

.search-result-item-4 img {
  display: table-cell;
  vertical-align: top;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
}

.search-result-item-4 .user-info {
  display: table-cell;
  vertical-align: top;
}

.search-result-item-4 .user-click {
  display: block;
  font-size: 1rem;
  margin-bottom: 5px;
  font-weight: bold;
  position: relative;
  left: 7vh;
  bottom: 3.1vh;
}

.search-result-item-4 .friend-email {
  display: block;
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 10px;
}

.search-result-item-4 .button-group {
  display: block;
}

.search-result-item-4 button {
  background-color: #333;
  color: white;
  padding: 6px 6px;
  border-radius: 8px;
  cursor: pointer;
  margin-left: 22px;
}

.search-result-item-4 button:hover {
  background-color: #ddd;
}

.search-result-item-1 {
  background-color: #f1f5f9;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  overflow: hidden;
  display: table; /* 테이블 레이아웃 사용 */
  width: 50%;
  list-style: none;
}

.search-result-item-1 .user-click {
  /* display: block; */
  font-size: 1rem;
  margin-bottom: 5px;
  font-weight: bold;
  position: relative;
  left: 1vh;
  bottom: 1.5vh;
}

.search-result-item-1 button {
  background-color: #333;
  color: white;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  margin-left: 44px;
  margin-top: 7px;
  position: absolute;
}

.friend-email {
  margin-left: auto;
  font-size: 0.9rem;
  color: #6b7280;
}

button {
  background-color: #333;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-left: 10px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #ddd;
}

.delete-button,
.delete-button-ex {
  background-color: #e53e3e;
}

.delete-button:hover,
.delete-button-ex:hover {
  background-color: #c53030;
}

.request-exchange-button {
  background-color: #333333;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  margin-left: 6vh;
}

.request-exchange-button:hover {
  background-color: #059669;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000; /* 모달 오버레이의 z-index를 높게 설정 */
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  z-index: 1001; /* 모달 컨텐츠의 z-index도 높게 설정 */
}

.modal {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

input,
textarea {
  width: 100%;
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.top-section {
  display: flex;
  gap: 20px;
}

.middle-section {
  position: relative;
  display: flex;
  gap: 20px;
  margin-top: 20px;
  /* height: auto; 추가 */
}

/* 교환 일기 항목 스타일 추가 */
.exchange-diary-item {
  list-style: none;
  background-color: #ffffff;
  border-radius: 10px;
  margin-bottom: 15px;
  padding: 15px;
  border: 1px solid #e2e8f0;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.exchange-diary-item:hover {
  transform: translateY(-3px); /* 호버 시 이동 효과 */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1); /* 호버 시 그림자 강조 */
}

.exchange-diary-item h4 {
  margin-bottom: 10px;
  font-size: 1.2rem;
  color: #333; /* 제목 색상 */
  cursor: pointer;
}

.exchange-diary-item ul {
  padding-left: 0px; /* 서브 리스트 들여쓰기 */
}
.request-list {
  padding: 0;
}

.delete-button-4 {
  position: relative;
  left: 16vh;
  bottom: 7vh;
}
</style>
