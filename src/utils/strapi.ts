import { computed, ref } from "vue";
import { useRange } from "elektro";
import { $fetch } from "ohmyfetch";
import { compareDesc } from "date-fns";

import { config, formatMarkdown, replaceTokens } from ".";

// TODO: Add Event and Project typings

function sortProject(a: any, b: any) {
  return Number(b.pinned) - Number(a.pinned);
}

function filterProject(project: any) {
  return !["kohe2022", "signal", "other"].includes(project.slug);
}

function sortEvents(a: any, b: any) {
  return compareDesc(new Date(b.start_at), new Date(a.start_at));
}

function processProject(project: any) {
  // Augment image data
  project.images = project.images.map((image: any) => {
    const imageData = {
      sizes: Object.values(image.formats),
      alt: image.alternativeText,
      caption: image.caption,
    };
    return { ...image, ...imageData };
  });

  project.thumbnail = project.images[0]?.url;

  // Convert Markdown to HTML
  project.description_intro = formatMarkdown(project.intro);
  project.description_english = formatMarkdown(project.description_english);
  project.description_estonian = formatMarkdown(project.description_estonian);

  project.events = (project.events || [])
    .map((event: any) => {
      // Convert Markdown to HTML
      event.description_english = formatMarkdown(event.description_english);
      event.description_estonian = formatMarkdown(event.description_estonian);
      // Augment events with reactive event data
      const eventData = useRange(
        new Date(event.start_at),
        new Date(event.end_at),
      );
      const liveUrl = replaceTokens(config.liveUrl as string, {
        projectSlug: project.slug,
        eventSlug: event.slug,
      });
      return { ...event, ...eventData, liveUrl };
    })
    .sort(sortEvents);

  const p = project.events.filter(
    (event: any) => event.urgency.value !== "past",
  );

  project.upcomingEvents = p.length ? p : null;

  return project;
}

export function useProjects() {
  const projects = ref<any>([]);
  // TODO use more of Strapi sorting and filtering
  $fetch(
    `${config.strapiUrl}/festivals?_sort=created_at:DESC&_limit=-1&slug_nin=kohe2022&slug_nin=signal&slug_nin=other`,
  ).then((f) => {
    projects.value = f.sort(sortProject).map(processProject);
  });

  const upcomingProjects = computed(() => {
    const p = projects.value.filter((project: any) => project.upcomingEvents);
    return p.length ? p : null;
  });

  const firstUpcomingProject = computed(() => {
    return upcomingProjects.value ? upcomingProjects.value[0] : null;
  });

  return { projects, upcomingProjects, firstUpcomingProject };
}

export function useProjectBySlug(slug: string) {
  const project = ref<any>();
  $fetch(`${config.strapiUrl}/festivals?slug=${slug}`).then(
    (f) => (project.value = f.map(processProject)[0]),
  );
  return { project };
}

export async function getPodcast() {
  return await $fetch(`${config.strapiUrl}/festivals?slug=signal`).then(
    (f) => f.map(processProject)[0],
  );
}
