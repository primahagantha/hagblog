<template>
  <div class="diff-viewer">
    <div class="diff-header">
      <span class="diff-title">Changes</span>
    </div>
    <div class="diff-container">
      <!-- Before Panel -->
      <div v-if="before" class="diff-panel before">
        <div class="panel-header">
          <span class="panel-label">Before</span>
        </div>
        <div class="panel-content">
          <div v-for="(value, key) in before" :key="`before-${key}`" class="diff-row">
            <span class="diff-key">{{ key }}:</span>
            <span 
              class="diff-value" 
              :class="{ changed: hasChanged(key) }"
            >
              {{ formatValue(value) }}
            </span>
          </div>
          <div v-if="Object.keys(before).length === 0" class="empty-panel">
            No data
          </div>
        </div>
      </div>

      <!-- Arrow -->
      <div v-if="before && after" class="diff-arrow">
        →
      </div>

      <!-- After Panel -->
      <div v-if="after" class="diff-panel after">
        <div class="panel-header">
          <span class="panel-label">After</span>
        </div>
        <div class="panel-content">
          <div v-for="(value, key) in after" :key="`after-${key}`" class="diff-row">
            <span class="diff-key">{{ key }}:</span>
            <span 
              class="diff-value" 
              :class="{ changed: hasChanged(key) }"
            >
              {{ formatValue(value) }}
            </span>
          </div>
          <div v-if="Object.keys(after).length === 0" class="empty-panel">
            No data
          </div>
        </div>
      </div>
    </div>

    <!-- Changes Summary -->
    <div v-if="changedKeys.length > 0" class="changes-summary">
      <span class="summary-label">Changed fields:</span>
      <span 
        v-for="key in changedKeys" 
        :key="key" 
        class="changed-field"
      >
        {{ key }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  before?: Record<string, any>
  after?: Record<string, any>
}

const props = defineProps<Props>()

// Compute which keys have changed
const changedKeys = computed(() => {
  if (!props.before || !props.after) return []
  
  const allKeys = new Set([
    ...Object.keys(props.before),
    ...Object.keys(props.after)
  ])
  
  return Array.from(allKeys).filter(key => {
    const beforeVal = JSON.stringify(props.before?.[key])
    const afterVal = JSON.stringify(props.after?.[key])
    return beforeVal !== afterVal
  })
})

// Check if a specific key has changed
const hasChanged = (key: string) => {
  return changedKeys.value.includes(key)
}

// Format value for display
const formatValue = (value: any): string => {
  if (value === null || value === undefined) {
    return 'null'
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }
  return String(value)
}
</script>

<style scoped>
.diff-viewer {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--bg-tertiary);
}

.diff-header {
  padding: var(--space-2) var(--space-3);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.diff-title {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
}

.diff-container {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-3);
  align-items: flex-start;
}

.diff-panel {
  flex: 1;
  min-width: 0;
}

.panel-header {
  padding: var(--space-2);
  background: var(--bg-secondary);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  border: 1px solid var(--border-color);
  border-bottom: none;
}

.panel-label {
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
}

.diff-panel.before .panel-label {
  color: #dc2626;
}

.diff-panel.after .panel-label {
  color: #16a34a;
}

.panel-content {
  padding: var(--space-3);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  font-family: monospace;
  font-size: var(--text-xs);
  max-height: 300px;
  overflow-y: auto;
}

.diff-row {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-1) 0;
  border-bottom: 1px solid var(--border-color);
}

.diff-row:last-child {
  border-bottom: none;
}

.diff-key {
  color: var(--text-muted);
  font-weight: 500;
  min-width: 100px;
  flex-shrink: 0;
}

.diff-value {
  color: var(--text-primary);
  word-break: break-word;
}

.diff-value.changed {
  background: #fef3c7;
  color: #92400e;
  padding: 0 var(--space-1);
  border-radius: var(--radius-sm);
}

.diff-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xl);
  color: var(--text-muted);
  padding: var(--space-4) 0;
}

.empty-panel {
  color: var(--text-muted);
  font-style: italic;
}

.changes-summary {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  align-items: center;
}

.summary-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.changed-field {
  font-size: var(--text-xs);
  background: #fef3c7;
  color: #92400e;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-family: monospace;
}
</style>
