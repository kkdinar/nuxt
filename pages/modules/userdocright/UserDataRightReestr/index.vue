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
        <Column field="Name" header="Наименование">
          <template #body="slotProps">
            <Button :label="slotProps.data.Name" class="p-button-link" @click="Link(slotProps.data.id)"/>
          </template>
        </Column>
        <Column field="User_Name" header="Пользователь">
          <template #body="slotProps">
            <Button :label="slotProps.data.User_Name" class="p-button-link" @click="Link(slotProps.data.id)"/>
          </template>
        </Column>
        <Column field="ModuleName" header="Модуль"></Column>
        <Column field="Form_Name" header="Форма"></Column>
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
      selectedRows: [],
    };
  },
  async mounted() {
    const config = {
      params: {
        module: "userdocright",
        form: "UserDataRightReestr",
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
    Link(id) {
      return this.$router.push("/modules/userdocright/UserDataRightReestr/UserDataRight?id=" + id);
    },
    clickExit() {
      this.$router.push("/modules/userdocright");
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
