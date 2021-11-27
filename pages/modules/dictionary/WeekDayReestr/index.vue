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
      <DataTable :value="FormData.Entity" :selection.sync="selectedRows" dataKey="id" class="p-datatable-gridlines">
        <Column selectionMode="multiple" headerStyle="width: 3em"></Column>
        <Column field="id" header="Код" headerStyle="width: 5em"></Column>
        <Column field="Name" header="Наименование"></Column>
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
        module: "dictionary",
        form: "WeekDayReestr",
        UserAuthID: localStorage.getItem("UserAuthID"),
      },
    };
    const answer = await this.$axios.$get("api", config);
    if (answer.Error == "Token is expired") this.$router.push("/auth");
    if (answer.Error)
      this.messages = [{ severity: "error", content: answer.Error }];
    else this.FormData = answer;
  },
  methods: {
    clickExit() {
      this.$router.push("/modules/dictionary");
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
