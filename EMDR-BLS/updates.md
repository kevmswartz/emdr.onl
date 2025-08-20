# Proposed Code Updates

Here is a list of proposed changes to improve the EMDR-BLS application codebase.

## 1. Critical Bug Fix: Settings Not Saving Correctly

**File:** `src/hooks/useSettings.tsx`

**Issue:**
There is a critical bug in both the `useBLSSettings` and `useGlobalSettings` hooks. The `updateSettings` function in each hook is saving the *partial* settings object instead of the complete, updated settings object. This can lead to inconsistent state and data loss, which is likely the cause of the update issues you're experiencing.

**Incorrect Code:**
```typescript
// in useBLSSettings
await settingsStorage.setBLSSettings(newSettings);

// in useGlobalSettings
await settingsStorage.setGlobalSettings(newSettings);
```

**Proposed Fix:**
The `setBLSSettings` and `setGlobalSettings` functions should be called with the `updated` object, which contains the merged settings.

**Corrected Code:**
```typescript
// in useBLSSettings
await settingsStorage.setBLSSettings(updated);

// in useGlobalSettings
await settingsStorage.setGlobalSettings(updated);
```

## 2. Minor Improvement: Remove Redundant Accessibility Props

**File:** `src/screens/MainMenuScreen.tsx`

**Issue:**
The `TouchableOpacity` components have an `accessible={true}` prop. This is redundant because `TouchableOpacity` is accessible by default. Removing this prop will make the code slightly cleaner.

**Example:**
```typescript
// Before
<TouchableOpacity
  // ...
  accessible={true}
>
  <Text style={styles.buttonText}>Guided EMDR Session</Text>
</TouchableOpacity>

// After
<TouchableOpacity
  // ...
>
  <Text style={styles.buttonText}>Guided EMDR Session</Text>
</TouchableOpacity>
```
---

These are the main issues I've found so far in my analysis. Applying the critical bug fix should resolve the problem with settings not updating correctly.
## 3. Architectural Improvements for `BLSToolScreen.tsx`

**File:** `src/screens/BLSToolScreen.tsx`

The `BLSToolScreen` component is functional, but it has some architectural issues that could make it difficult to maintain and extend in the future.

### Issues and Recommendations:

*   **Complex State Management:** The component uses many `useState` hooks to manage its internal state. This makes the component difficult to reason about.
    *   **Recommendation:** Consider using a state management library like Redux or Zustand, or the built-in `useReducer` hook, to manage the component's complex state more effectively.

*   **Nested Settings Updates:** The code for updating nested settings objects (like `visual` or `audio`) is verbose and duplicated.
    *   **Recommendation:** Create more specific update functions within the `useBLSSettings` hook to encapsulate the logic for updating nested objects. For example, `updateVisualSettings({ backgroundColor: '#000000' })`.

*   **Hardcoded Values:** There are many hardcoded values for colors, speeds, durations, etc., throughout the component.
    *   **Recommendation:** Define these values as constants in a separate theme or constants file to make them easier to manage and update.

*   **Large Component:** The `BLSToolScreen` component is very large and handles many different responsibilities.
    *   **Recommendation:** Break down the component into smaller, more manageable components. For example, the different setting groups (speed, duration, shape, etc.) could be extracted into their own components.

*   **Outdated `Dimensions` API:** The component uses the `Dimensions` API to get screen dimensions.
    *   **Recommendation:** Use the more modern `useWindowDimensions` hook, which automatically updates when the screen dimensions change.
## 4. Architectural Improvements for `BilateralStimulation.tsx`

**File:** `src/components/BilateralStimulation.tsx`

The `BilateralStimulation` component is the core of the stimulation functionality. It is well-featured, but has some architectural issues that could be improved.

### Issues and Recommendations:

*   **Outdated `Dimensions` API:** The component uses `Dimensions.get('window').width` to calculate the movement range of the animated shape. This value is not updated when the screen orientation changes.
    *   **Recommendation:** Use the `useWindowDimensions` hook to get the screen width. This will ensure the movement range is always calculated correctly.

*   **Complex `useEffect` Hooks:** The component has several large and complex `useEffect` hooks, especially the main animation hook. This makes the code difficult to read and understand.
    *   **Recommendation:** Refactor the animation logic into smaller, more focused functions. The main `useEffect` hook could be simplified by calling these functions.

*   **Animation Implementation:** The animation is implemented using `Animated.timing` and a recursive `runAnimation` function.
    *   **Recommendation:** Since `react-native-reanimated` is already a dependency, consider using it for the animation. It provides a more powerful and declarative API for creating complex animations and could simplify the animation logic.

*   **State Management:** The component has its own state for `currentSpeed` and `sessionStartTime`, which is also managed in the parent `BLSToolScreen`. This duplication of state can lead to inconsistencies.
    *   **Recommendation:** Lift the state up to the parent component (`BLSToolScreen`) and pass it down as props. This would make the `BilateralStimulation` component more of a "dumb" component that simply renders the stimulation based on the props it receives.

*   **Hardcoded Values:** There are some hardcoded values, like the movement range calculation (`screenWidth * 0.45`) and the `setTimeout` delay (50ms).
    *   **Recommendation:** Define these as clearly named constants to improve readability and maintainability.
