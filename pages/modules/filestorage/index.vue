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
        <Column field="Name" header="Наименование файла"></Column>
        <Column field="Size" header="Размер"></Column>
        <Column field="Contractor_Name" header="Организация"></Column>
        <Column field="User_Name" header="Пользователь"></Column>
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
        module: "filestorage",
        form: "FileStorageReestr",
        UserAuthID: localStorage.getItem("UserAuthID"),
      },
    };
    const answer = await this.$axios.$get("api", config);
    if (answer.Error == "Token is expired") this.$router.push("/auth");
    if (answer.Error)
      this.messages = [{ severity: "error", content: answer.Error }];

    this.FormData = answer;
  },
  methods: {
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
