<template>
  <div class="container">
    <div>
      <Toolbar>
        <template #left>
          <Button label="Выйти" icon="pi pi-times" @click="clickExit()"/>
        </template>
      </Toolbar>
      <transition-group name="p-messages" tag="div">
        <Message v-for="msg of messages" :life="3000" :sticky="false" :severity="msg.severity" :key="msg.content">{{msg.content}}</Message>
      </transition-group>
      <DataTable :value="FormData.Entity" class="p-datatable-gridlines" :autoLayout="true">
        <Column field="id" header="Код"></Column>
        <Column field="Name" header="Наименование документа">
          <template #body="slotProps">
            <Button :label="slotProps.data.Name" class="p-button-link" @click="Link(slotProps.data.form)"/>
          </template>
        </Column>
      </DataTable>     
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      FormData: {},
      messages: [],
    };
  },
  async mounted() {
    const config = {
      params: {
        module: "userdocright",
        UserAuthID: localStorage.getItem("UserAuthID"),
      },
    };
    const answer = await this.$axios.$get("api", config);
    if (answer.Error == "Token is expired") this.$router.push("/auth");
    if (answer.Error)
      this.messages = [{ severity: "error", content: answer.Error }];
    else {
      const entity = answer.Entity.filter((r) => r.DisplayForm);
      answer.Entity = entity;
      this.FormData = answer;
    }
  },
  methods: {
    Link(form) {
      return this.$router.push("/modules/userdocright/" + form);
    },
    clickExit() {
      this.$router.push("/modules/");
    },
  },
};
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
