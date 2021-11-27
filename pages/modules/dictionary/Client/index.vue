<template>
  <div class="container">
    <div>
      <Toolbar>
        <template #left>
          <Button label="Выйти" icon="pi pi-times" @click="clickExit()"/>
          <i class="pi pi-bars p-toolbar-separator p-mr-2" />
          <Button label="Создать" icon="pi pi-plus" @click="clickNew()" class="p-button-success"/>
          <i class="pi pi-bars p-toolbar-separator p-mr-2" />
          <Button label="Удалить" icon="pi pi-trash" @click="clickDelete()" class="p-button-error"/>
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
        <Column field="Description" header="Описание"></Column>
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
        module: "dictionary",
        form: "Client",
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
      return this.$router.push("/modules/dictionary/Client/id?id=" + id);
    },
    clickExit() {
      this.$router.push("/modules/dictionary");
    },
    async clickNew() {
      const formData = {
        module: "dictionary",
        form: "Client",
        UserAuthID: localStorage.getItem("UserAuthID"),
      };

      const answer = await this.$axios.$post("api", formData);
      if (answer.Error)
        this.$data.messages = [{ severity: "error", content: answer.Error }];
      else {
        return this.$router.push(
          "/dictionary/Client/id?id=" + answer.DocMovement.id
        );
      }
    },
    async clickDelete() {
      const formData = {
        data: {
          module: "dictionary",
          form: "Client",
          data: {
            DocMovement: this.$data.selectedRows,
          },
          UserAuthID: localStorage.getItem("UserAuthID"),
        },
      };
      const answer = await this.$axios.$delete("api", formData);
      if (answer.Error)
        this.$data.messages = [{ severity: "error", content: answer.Error }];
      else {
        const newTable = [];
        this.$data.FormData.Entity.forEach((row) => {
          if (!this.$data.selectedRows.some((r) => row.id == r.id))
            newTable.push(row);
        });
        this.$data.FormData.Entity = newTable;
        this.$data.selectedRows = [];
      }
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
