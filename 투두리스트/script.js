/**
 * 투두리스트 (To-Do List) 자바스크립트 로직
 * - 할 일 추가 및 삭제 기능
 * - 완료 상태 토글 및 취소선 표시
 * - 로컬스토리지(localStorage) 데이터 영구 저장
 * - 필터링 기능 (전체, 진행 중, 완료됨)
 * - 진행률 및 통계 실시간 업데이트
 */

// 로컬스토리지 키 정의
const STORAGE_KEY = 'vibe_coding_todos';

// 상태 관리
let todos = [];
let currentFilter = 'all';

// DOM 요소 참조
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const currentDateEl = document.getElementById('currentDate');
const progressText = document.getElementById('progressText');
const progressBar = document.getElementById('progressBar');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');

// 1. 애플리케이션 초기화
function initApp() {
  // 오늘 날짜 표시 설정
  renderCurrentDate();
  
  // 로컬스토리지에서 데이터 불러오기
  loadTodos();
  
  // 이벤트 리스너 등록
  setupEventListeners();
  
  // 초기 렌더링
  renderTodos();
}

// 2. 현재 날짜 포맷팅 및 표시
function renderCurrentDate() {
  const now = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
  currentDateEl.textContent = now.toLocaleDateString('ko-KR', options);
}

// 3. 로컬스토리지 데이터 로드 및 저장
function loadTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    todos = saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('로컬스토리지 불러오기 오류:', error);
    todos = [];
  }
}

function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error('로컬스토리지 저장 오류:', error);
  }
}

// 4. 이벤트 리스너 설정
function setupEventListeners() {
  // 폼 제출 (할 일 추가)
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (!text) {
      todoInput.focus();
      return;
    }
    addTodo(text);
    todoInput.value = '';
    todoInput.focus();
  });

  // 필터 버튼 클릭 이벤트
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTodos();
    });
  });

  // 완료된 항목 일괄 삭제
  clearCompletedBtn.addEventListener('click', () => {
    const hasCompleted = todos.some((todo) => todo.completed);
    if (!hasCompleted) return;
    
    if (confirm('완료된 할 일 항목들을 모두 삭제하시겠습니까?')) {
      todos = todos.filter((todo) => !todo.completed);
      saveTodos();
      renderTodos();
    }
  });
}

// 5. 할 일 추가 함수
function addTodo(text) {
  const newTodo = {
    id: Date.now().toString(),
    text: text,
    completed: false,
    createdAt: new Date().toISOString()
  };

  todos.unshift(newTodo); // 최신 항목을 상단에 추가
  saveTodos();
  renderTodos();
}

// 6. 할 일 삭제 함수
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
}

// 7. 완료 상태 토글 함수
function toggleTodo(id) {
  todos = todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  });
  saveTodos();
  renderTodos();
}

// 8. 진행률 업데이트 함수
function updateProgress() {
  const total = todos.length;
  const completed = todos.filter((todo) => todo.completed).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  progressText.textContent = `${completed} / ${total} 완료 (${percentage}%)`;
  progressBar.style.width = `${percentage}%`;
}

// 9. 전체 화면 렌더링 함수
function renderTodos() {
  // 필터링 적용
  const filteredTodos = todos.filter((todo) => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true; // 'all'
  });

  // 목록 초기화
  todoList.innerHTML = '';

  // 비어있을 때 안내 메시지 제어
  if (filteredTodos.length === 0) {
    emptyState.style.display = 'flex';
  } else {
    emptyState.style.display = 'none';
  }

  // 아이템 생성 및 삽입
  filteredTodos.forEach((todo) => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.id = todo.id;

    // 내용 영역 (체크박스 + 텍스트)
    const contentDiv = document.createElement('div');
    contentDiv.className = 'todo-content';

    const checkbox = document.createElement('div');
    checkbox.className = 'custom-checkbox';
    checkbox.setAttribute('role', 'checkbox');
    checkbox.setAttribute('aria-checked', todo.completed);
    checkbox.addEventListener('click', () => toggleTodo(todo.id));

    const spanText = document.createElement('span');
    spanText.className = 'todo-text';
    spanText.textContent = todo.text;
    spanText.addEventListener('click', () => toggleTodo(todo.id));

    contentDiv.appendChild(checkbox);
    contentDiv.appendChild(spanText);

    // 삭제 버튼 (휴지통)
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.setAttribute('title', '삭제');
    deleteBtn.setAttribute('aria-label', '할 일 삭제');
    deleteBtn.innerHTML = '✕';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTodo(todo.id);
    });

    li.appendChild(contentDiv);
    li.appendChild(deleteBtn);
    todoList.appendChild(li);
  });

  // 진행률 바 갱신
  updateProgress();
}

// 초기 실행
document.addEventListener('DOMContentLoaded', initApp);

