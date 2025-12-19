<template>
  <div class="error-page">
    <div class="error-bg"></div>
    <div class="container error-container">
      <div class="error-content" :class="{ 'game-active': showGame }">
        <!-- Error Message -->
        <div v-if="!showGame" class="error-message animate-slide-up">
          <span class="error-code">404</span>
          <h1 class="error-title">Page Not Found</h1>
          <p class="error-desc">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <div class="error-actions">
            <NuxtLink to="/" class="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Back to Home
            </NuxtLink>
            <NuxtLink to="/blog" class="btn btn-secondary">Browse Blog</NuxtLink>
          </div>
          <button class="easter-trigger" @click="startGame">
            🎮 Bored? Click here...
          </button>
        </div>

        <!-- Tic Tac Toe Game -->
        <div v-else class="game-container animate-fade-in">
          <div class="game-header">
            <h2 class="game-title">🎮 Tic-Tac-Toe</h2>
            <button class="btn btn-ghost" @click="showGame = false">✕ Close</button>
          </div>
          
          <div class="game-status">
            <span v-if="winner" class="winner-text">
              {{ winner === 'draw' ? "It's a Draw! 🤝" : `${winner} Wins! 🎉` }}
            </span>
            <span v-else>{{ isXTurn ? "Your turn (X)" : "AI thinking... (O)" }}</span>
          </div>

          <div class="game-board">
            <button 
              v-for="(cell, i) in board" 
              :key="i" 
              class="game-cell"
              :class="{ 'cell-x': cell === 'X', 'cell-o': cell === 'O', 'cell-win': winningCells.includes(i) }"
              @click="makeMove(i)"
              :disabled="cell !== null || winner !== null || !isXTurn"
            >
              {{ cell }}
            </button>
          </div>

          <div class="game-stats">
            <div class="stat">
              <span class="stat-label">You (X)</span>
              <span class="stat-value">{{ stats.x }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Draw</span>
              <span class="stat-value">{{ stats.draw }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">AI (O)</span>
              <span class="stat-value">{{ stats.o }}</span>
            </div>
          </div>

          <button class="btn btn-primary" @click="resetGame">
            🔄 New Game
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({ title: '404 - Page Not Found | HagBlog' })

const showGame = ref(false)
const board = ref<(string | null)[]>(Array(9).fill(null))
const isXTurn = ref(true)
const winner = ref<string | null>(null)
const winningCells = ref<number[]>([])
const stats = ref({ x: 0, o: 0, draw: 0 })

const winPatterns = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6] // diagonals
]

const startGame = () => {
  showGame.value = true
  resetGame()
}

const checkWinner = (b: (string | null)[]) => {
  for (const pattern of winPatterns) {
    const [a, c, d] = pattern
    if (b[a] && b[a] === b[c] && b[a] === b[d]) {
      return { winner: b[a], cells: pattern }
    }
  }
  if (b.every(cell => cell !== null)) return { winner: 'draw', cells: [] }
  return null
}

const makeMove = (index: number) => {
  if (board.value[index] || winner.value || !isXTurn.value) return
  
  board.value[index] = 'X'
  const result = checkWinner(board.value)
  if (result) {
    winner.value = result.winner
    winningCells.value = result.cells
    if (result.winner === 'X') stats.value.x++
    else if (result.winner === 'draw') stats.value.draw++
    return
  }
  
  isXTurn.value = false
  setTimeout(aiMove, 500)
}

const aiMove = () => {
  const empty = board.value.map((c, i) => c === null ? i : -1).filter(i => i !== -1)
  if (empty.length === 0) return
  
  // Simple AI: try to win, block, or random
  let move = -1
  
  // Try to win
  for (const i of empty) {
    const test = [...board.value]
    test[i] = 'O'
    if (checkWinner(test)?.winner === 'O') { move = i; break }
  }
  
  // Block player
  if (move === -1) {
    for (const i of empty) {
      const test = [...board.value]
      test[i] = 'X'
      if (checkWinner(test)?.winner === 'X') { move = i; break }
    }
  }
  
  // Take center or corner
  if (move === -1 && empty.includes(4)) move = 4
  if (move === -1) {
    const corners = [0, 2, 6, 8].filter(i => empty.includes(i))
    if (corners.length) move = corners[Math.floor(Math.random() * corners.length)]
  }
  
  // Random
  if (move === -1) move = empty[Math.floor(Math.random() * empty.length)]
  
  board.value[move] = 'O'
  const result = checkWinner(board.value)
  if (result) {
    winner.value = result.winner
    winningCells.value = result.cells
    if (result.winner === 'O') stats.value.o++
    else if (result.winner === 'draw') stats.value.draw++
  }
  isXTurn.value = true
}

const resetGame = () => {
  board.value = Array(9).fill(null)
  winner.value = null
  winningCells.value = []
  isXTurn.value = true
}
</script>

<style scoped>
.error-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
.error-bg { position: absolute; inset: 0; background: linear-gradient(135deg, var(--primary-900) 0%, var(--neutral-900) 50%, var(--primary-800) 100%); z-index: -1; }
.error-bg::before { content: ''; position: absolute; inset: 0; background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
.error-container { text-align: center; }
.error-content { padding: var(--space-8); }

/* Error Message */
.error-code { font-size: 8rem; font-weight: 800; line-height: 1; background: linear-gradient(135deg, var(--primary-400), var(--accent-500)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: block; text-shadow: 0 0 60px rgba(59, 130, 246, 0.3); }
.error-title { font-size: var(--text-3xl); color: white; margin: var(--space-4) 0; }
.error-desc { font-size: var(--text-lg); color: var(--neutral-400); max-width: 400px; margin: 0 auto var(--space-8); }
.error-actions { display: flex; gap: var(--space-4); justify-content: center; margin-bottom: var(--space-8); }
.easter-trigger { background: none; border: none; color: var(--neutral-500); font-size: var(--text-sm); cursor: pointer; padding: var(--space-2); transition: color var(--transition-fast); }
.easter-trigger:hover { color: var(--accent-500); }

/* Game Container */
.game-container { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); padding: var(--space-8); border-radius: var(--radius-2xl); max-width: 380px; margin: 0 auto; }
.game-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); }
.game-title { font-size: var(--text-xl); color: white; margin: 0; }
.game-status { font-size: var(--text-sm); color: var(--neutral-300); margin-bottom: var(--space-4); height: 24px; }
.winner-text { color: var(--accent-400); font-weight: 600; }

/* Game Board */
.game-board { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-2); margin-bottom: var(--space-6); }
.game-cell { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 700; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: var(--radius-lg); cursor: pointer; transition: all var(--transition-fast); color: white; }
.game-cell:hover:not(:disabled) { background: rgba(255, 255, 255, 0.2); transform: scale(1.05); }
.game-cell:disabled { cursor: default; }
.cell-x { color: var(--primary-400); }
.cell-o { color: var(--accent-400); }
.cell-win { background: rgba(16, 185, 129, 0.3); border-color: var(--success); animation: pulse 0.5s ease; }

/* Stats */
.game-stats { display: flex; justify-content: center; gap: var(--space-6); margin-bottom: var(--space-4); }
.stat { text-align: center; }
.stat-label { display: block; font-size: var(--text-xs); color: var(--neutral-400); }
.stat-value { font-size: var(--text-xl); font-weight: 700; color: white; }

@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }

.animate-slide-up { animation: slideUp 0.5s ease-out; }
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
