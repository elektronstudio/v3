<script setup lang="ts">
import { useProjectBySlug } from "../utils";
const project = useProjectBySlug("kohe2022");
</script>

<template>
  <article class="Page SingleProduction">
    <header>
      <ETitle el="h1" size="lg" :title="project.title" />
      <h4 v-if="project.authors">{{ project.authors }}</h4>

      <!-- @TODO: Add locale based conditionals -->
      <EContent
        v-if="project.description_intro"
        class="Description"
        size="lg"
        :content="project.description_intro"
      />
    </header>
    <ImageSlider v-if="project.images" :images="project.images" />
    <main>
      <EBox class="MainContent">
        <!-- @TODO: Add metadata -->
        <EDetailsList v-if="project.details" :details="project.details" />
        <EContent :content="project.description_estonian" />
      </EBox>
      <EBox
        v-if="project.upcomingEvents || project.press"
        class="SideContent"
        el="aside"
      >
        <template v-if="project.upcomingEvents">
          <ETitle el="h3" size="lg">Etendused</ETitle>
          <template v-for="event in project.upcomingEvents">
            <EEventInstance
              :title="event.title"
              :start-at="event.formattedFromDatetime"
              layout="vertical"
              :ticket-url="event.ticketUrl"
            />
          </template>
        </template>
        <!-- @TODO: Add press -->
        <!-- <template v-if="press">
          <ETitle el="h3" size="lg">Press</ETitle>
          <EPressItems :items="press" />
        </template> -->
      </EBox>
    </main>
  </article>
</template>

<style scoped>
.Page.SingleProduction header,
.Page.SingleProduction main {
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: var(--gap-5);
  padding: var(--p-4);
  color: var(--gray-300);
}
.Page.SingleProduction header {
  grid-template-areas:
    "title"
    "subtitle"
    "description";
}
.Page.SingleProduction main {
  grid-template-areas:
    "main"
    "side";
}
.Page.SingleProduction header h1 {
  grid-area: title;
}
.Page.SingleProduction header h4 {
  grid-area: subtitle;
  align-self: end;
}
.Page.SingleProduction header .Description {
  grid-area: description;
}
.MainContent {
  grid-area: main;
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: var(--gap-5);
}
.SideContent {
  grid-area: side;
  align-self: start;
}
.SideContent h3 {
  margin-bottom: var(--m-6);
}
.SideContent h3:not(:first-child) {
  margin-top: var(--m-8);
}
/* @TODO: Add breakpoints system */
@media only screen and (max-width: 599px) {
  .EContent.Description :deep(p) {
    font-size: var(--text-xl);
  }
}
@media only screen and (min-width: 600px) {
  .Page.SingleProduction header,
  .Page.SingleProduction main {
    grid-template-columns: repeat(4, 1fr);
  }
  .Page.SingleProduction header {
    grid-template-areas:
      "title description description description"
      "subtitle description description description";
  }
  .Page.SingleProduction main {
    grid-template-areas: "main main main main" "side side side side";
  }
  .MainContent {
    grid-template-areas: "details content";
    grid-template-columns: 2fr 3fr;
  }
  .MainContent .EDetailsList {
    grid-area: details;
  }
  .MainContent .EContent {
    grid-area: content;
  }
}
@media only screen and (min-width: 1240px) {
  .Page.SingleProduction header,
  .Page.SingleProduction main {
    grid-template-columns: repeat(8, 1fr);
  }
  .Page.SingleProduction header {
    grid-template-areas:
      "title title description description description description . ."
      "subtitle subtitle description description description description . .";
  }
  .Page.SingleProduction main {
    grid-template-areas: "main main main main main side side side";
  }
}
</style>
