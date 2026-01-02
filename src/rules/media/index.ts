// ============================================
// TheWCAG Evaluation Extension - Media Rules
// Rules for audio, video, and animation accessibility
// ============================================

import { AccessibilityRule, RuleResult } from '../../types';
import { getSelector, getXPath, getAccessibleName } from '../../utils/dom-utils';
import { createRule } from '../index';

// ============================================
// Autoplay Rules (WCAG 1.4.2)
// ============================================

const audioAutoplay: AccessibilityRule = createRule('audio_autoplay', 'Audio may autoplay', 'error', {
  description: 'Audio element may play automatically',
  impact: 'serious',
  wcagCriteria: ['1.4.2'],
  wcagLevel: 'A',
  tags: ['media', 'audio'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'audio') return null;

    const audio = element as HTMLAudioElement;

    if (audio.autoplay) {
      // Check if it's muted (muted autoplay is generally acceptable)
      if (!audio.muted) {
        return {
          ruleId: 'audio_autoplay',
          category: 'error',
          element,
          selector: getSelector(element),
          xpath: getXPath(element),
          message: 'Audio autoplays without being muted',
          impact: 'serious',
          data: {
            src: audio.src || audio.querySelector('source')?.src,
            duration: audio.duration,
          },
        };
      }
    }

    return null;
  },
  documentation: {
    summary: 'Audio content plays automatically without user initiation.',
    purpose:
      'Automatically playing audio can interfere with screen readers and be disorienting.',
    actions: [
      'Remove autoplay attribute.',
      'If autoplay is necessary, mute by default.',
      'Provide clear controls to pause/stop audio.',
      'Limit autoplay to 3 seconds or less.',
    ],
    algorithm: 'Audio element has autoplay attribute without muted.',
    guidelines: [
      {
        id: '1.4.2',
        name: 'Audio Control',
        level: 'A',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/audio-control.html',
      },
    ],
  },
});

const videoAutoplay: AccessibilityRule = createRule('video_autoplay', 'Video may autoplay', 'alert', {
  description: 'Video element may play automatically',
  impact: 'moderate',
  wcagCriteria: ['1.4.2'],
  wcagLevel: 'A',
  tags: ['media', 'video'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'video') return null;

    const video = element as HTMLVideoElement;

    if (video.autoplay) {
      return {
        ruleId: 'video_autoplay',
        category: video.muted ? 'alert' : 'error',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: video.muted
          ? 'Video autoplays (muted) - ensure pause controls exist'
          : 'Video autoplays with sound',
        impact: video.muted ? 'moderate' : 'serious',
        data: {
          src: video.src || video.querySelector('source')?.src,
          muted: video.muted,
        },
      };
    }

    return null;
  },
  documentation: {
    summary: 'Video content plays automatically.',
    purpose: 'Auto-playing video can be distracting and consume bandwidth.',
    actions: [
      'Remove autoplay or keep muted.',
      'Provide pause, stop, and mute controls.',
      'Consider using prefers-reduced-motion.',
    ],
    algorithm: 'Video element has autoplay attribute.',
    guidelines: [
      {
        id: '1.4.2',
        name: 'Audio Control',
        level: 'A',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/audio-control.html',
      },
    ],
  },
});

// ============================================
// Captions and Transcripts Rules (WCAG 1.2.2, 1.2.3)
// ============================================

const videoCaptionsMissing: AccessibilityRule = createRule(
  'video_captions_missing',
  'Video may lack captions',
  'alert',
  {
    description: 'Video element may not have captions',
    impact: 'critical',
    wcagCriteria: ['1.2.2'],
    wcagLevel: 'A',
    tags: ['media', 'video', 'captions'],
    evaluate: (element: Element): RuleResult | null => {
      if (element.tagName.toLowerCase() !== 'video') return null;

      const video = element as HTMLVideoElement;

      // Check for track elements with captions
      const tracks = video.querySelectorAll('track');
      const hasCaptions = Array.from(tracks).some(
        (track) =>
          track.kind === 'captions' || track.kind === 'subtitles'
      );

      if (!hasCaptions) {
        return {
          ruleId: 'video_captions_missing',
          category: 'alert',
          element,
          selector: getSelector(element),
          xpath: getXPath(element),
          message: 'Video has no caption track - add captions for deaf/hard of hearing users',
          impact: 'critical',
          data: {
            src: video.src || video.querySelector('source')?.src,
            trackCount: tracks.length,
          },
        };
      }

      return null;
    },
    documentation: {
      summary: 'Video does not have captions or subtitles.',
      purpose: 'Captions are essential for deaf and hard of hearing users.',
      actions: [
        'Add a <track kind="captions"> element.',
        'Ensure captions are synchronized with audio.',
        'Include speaker identification and sound effects.',
      ],
      algorithm: 'Video element has no track with kind="captions" or "subtitles".',
      guidelines: [
        {
          id: '1.2.2',
          name: 'Captions (Prerecorded)',
          level: 'A',
          url: 'https://www.w3.org/WAI/WCAG21/Understanding/captions-prerecorded.html',
        },
      ],
    },
  }
);

const audioDescriptionMissing: AccessibilityRule = createRule(
  'audio_description_missing',
  'Video may lack audio description',
  'alert',
  {
    description: 'Video element may not have audio descriptions',
    impact: 'serious',
    wcagCriteria: ['1.2.3', '1.2.5'],
    wcagLevel: 'A',
    tags: ['media', 'video', 'audio-description'],
    evaluate: (element: Element): RuleResult | null => {
      if (element.tagName.toLowerCase() !== 'video') return null;

      const video = element as HTMLVideoElement;

      // Check for track elements with descriptions
      const tracks = video.querySelectorAll('track');
      const hasDescriptions = Array.from(tracks).some(
        (track) => track.kind === 'descriptions'
      );

      if (!hasDescriptions) {
        return {
          ruleId: 'audio_description_missing',
          category: 'alert',
          element,
          selector: getSelector(element),
          xpath: getXPath(element),
          message: 'Video has no audio description track for blind users',
          impact: 'serious',
          data: {
            src: video.src || video.querySelector('source')?.src,
          },
        };
      }

      return null;
    },
    documentation: {
      summary: 'Video does not have audio descriptions.',
      purpose: 'Audio descriptions help blind users understand visual content.',
      actions: [
        'Add a <track kind="descriptions"> element.',
        'Describe important visual information not in dialogue.',
        'Consider extended audio descriptions for complex content.',
      ],
      algorithm: 'Video element has no track with kind="descriptions".',
      guidelines: [
        {
          id: '1.2.3',
          name: 'Audio Description or Media Alternative',
          level: 'A',
          url: 'https://www.w3.org/WAI/WCAG21/Understanding/audio-description-or-media-alternative-prerecorded.html',
        },
      ],
    },
  }
);

// ============================================
// Animation Rules (WCAG 2.2.2, 2.3.3)
// ============================================

const animationExcessive: AccessibilityRule = createRule(
  'animation_excessive',
  'Potentially excessive animation',
  'alert',
  {
    description: 'Element may have distracting animations',
    impact: 'moderate',
    wcagCriteria: ['2.2.2', '2.3.3'],
    wcagLevel: 'A',
    tags: ['animation', 'motion'],
    evaluate: (element: Element): RuleResult | null => {
      const style = window.getComputedStyle(element);

      // Check for animations
      const animationName = style.animationName;
      const animationDuration = parseFloat(style.animationDuration);
      const animationIterationCount = style.animationIterationCount;

      if (animationName && animationName !== 'none') {
        // Check for infinite animations
        if (animationIterationCount === 'infinite') {
          return {
            ruleId: 'animation_excessive',
            category: 'alert',
            element,
            selector: getSelector(element),
            xpath: getXPath(element),
            message: 'Element has infinite animation - provide pause control',
            impact: 'moderate',
            data: { animationName, animationIterationCount },
          };
        }

        // Check for long animations (over 5 seconds)
        if (animationDuration > 5) {
          return {
            ruleId: 'animation_excessive',
            category: 'alert',
            element,
            selector: getSelector(element),
            xpath: getXPath(element),
            message: `Animation duration is ${animationDuration}s - consider shorter duration`,
            impact: 'minor',
            data: { animationName, animationDuration },
          };
        }
      }

      // Check for transitions that might be distracting
      const transitionDuration = parseFloat(style.transitionDuration);
      if (transitionDuration > 5) {
        return {
          ruleId: 'animation_excessive',
          category: 'alert',
          element,
          selector: getSelector(element),
          xpath: getXPath(element),
          message: `Transition duration is ${transitionDuration}s - consider shorter duration`,
          impact: 'minor',
          data: { transitionDuration },
        };
      }

      return null;
    },
    documentation: {
      summary: 'Element has potentially excessive or infinite animation.',
      purpose: 'Moving content can be distracting and cause vestibular issues.',
      actions: [
        'Provide controls to pause animations.',
        'Limit animations to 5 seconds or less.',
        'Respect prefers-reduced-motion media query.',
        'Avoid infinite animations without user control.',
      ],
      algorithm: 'Detects infinite animations or durations over 5 seconds.',
      guidelines: [
        {
          id: '2.2.2',
          name: 'Pause, Stop, Hide',
          level: 'A',
          url: 'https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html',
        },
        {
          id: '2.3.3',
          name: 'Animation from Interactions',
          level: 'AAA',
          url: 'https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html',
        },
      ],
    },
  }
);

const prefersReducedMotion: AccessibilityRule = createRule(
  'prefers_reduced_motion',
  'May not respect reduced motion',
  'alert',
  {
    description: 'Animation may not respect prefers-reduced-motion',
    impact: 'moderate',
    wcagCriteria: ['2.3.3'],
    wcagLevel: 'AAA',
    tags: ['animation', 'motion'],
    evaluate: (element: Element): RuleResult | null => {
      const style = window.getComputedStyle(element);
      const animationName = style.animationName;

      if (animationName && animationName !== 'none') {
        // This is a heuristic - can't fully check without CSS analysis
        // Alert on any animation as a reminder
        return {
          ruleId: 'prefers_reduced_motion',
          category: 'alert',
          element,
          selector: getSelector(element),
          xpath: getXPath(element),
          message: 'Verify animation respects prefers-reduced-motion',
          impact: 'moderate',
          data: { animationName },
        };
      }

      return null;
    },
    documentation: {
      summary: 'Animation should respect user preference for reduced motion.',
      purpose: 'Some users experience motion sickness from animations.',
      actions: [
        'Add @media (prefers-reduced-motion: reduce) to disable animations.',
        'Provide alternative static content when motion is reduced.',
        'Test with prefers-reduced-motion enabled.',
      ],
      algorithm: 'Detects animated elements that may need reduced motion handling.',
      guidelines: [
        {
          id: '2.3.3',
          name: 'Animation from Interactions',
          level: 'AAA',
          url: 'https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html',
        },
      ],
    },
  }
);

// ============================================
// Flashing Content Rules (WCAG 2.3.1)
// ============================================

const flashingContent: AccessibilityRule = createRule('flashing_content', 'Potential flashing content', 'error', {
  description: 'Content may flash more than 3 times per second',
  impact: 'critical',
  wcagCriteria: ['2.3.1'],
  wcagLevel: 'A',
  tags: ['animation', 'seizure'],
  evaluate: (element: Element): RuleResult | null => {
    const style = window.getComputedStyle(element);
    const animationName = style.animationName;
    const animationDuration = parseFloat(style.animationDuration);

    if (animationName && animationName !== 'none') {
      // Rough check: if animation is very fast and repeating
      if (animationDuration < 0.33 && style.animationIterationCount !== '1') {
        return {
          ruleId: 'flashing_content',
          category: 'error',
          element,
          selector: getSelector(element),
          xpath: getXPath(element),
          message: 'Animation may flash more than 3 times per second - seizure risk',
          impact: 'critical',
          data: { animationName, animationDuration },
        };
      }
    }

    return null;
  },
  documentation: {
    summary: 'Content may flash more than 3 times per second.',
    purpose: 'Flashing content can cause seizures in people with photosensitive epilepsy.',
    actions: [
      'Ensure flashing is less than 3 times per second.',
      'Keep flashing area small (under 21,824 sq pixels).',
      'Avoid red flashing entirely.',
      'Use the Photosensitive Epilepsy Analysis Tool (PEAT).',
    ],
    algorithm: 'Detects animations with duration under 333ms that may cause flashing.',
    guidelines: [
      {
        id: '2.3.1',
        name: 'Three Flashes or Below Threshold',
        level: 'A',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/three-flashes-or-below-threshold.html',
      },
    ],
  },
});

// ============================================
// Export all media rules
// ============================================
export const mediaRules: AccessibilityRule[] = [
  audioAutoplay,
  videoAutoplay,
  videoCaptionsMissing,
  audioDescriptionMissing,
  animationExcessive,
  prefersReducedMotion,
  flashingContent,
];

