/**
 * Score a guess against the target name.
 * Returns an array of 'correct' | 'present' | 'absent' for each letter.
 */
export function scoreGuess(word, target) {
  const w = word.toUpperCase().split('')
  const t = target.toUpperCase().split('')
  const result = Array(t.length).fill('absent')

  // First pass: correct positions
  w.forEach((l, i) => {
    if (l === t[i]) {
      result[i] = 'correct'
      t[i] = null
      w[i] = null
    }
  })

  // Second pass: present but wrong position
  w.forEach((l, i) => {
    if (l) {
      const j = t.indexOf(l)
      if (j > -1) {
        result[i] = 'present'
        t[j] = null
      }
    }
  })

  return result
}
