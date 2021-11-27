<template>
  <div class="container">
    <div>
      <transition-group name="p-messages" tag="div">
        <Message v-for="msg of messages" :life="3000" :sticky="false" :severity="msg.severity" :key="msg.content">{{msg.content}}</Message>
      </transition-group>
      <DataTable :value="FormData.Entity" class="p-datatable-gridlines" :autoLayout="true">
        <Column field="id" header="Код"></Column>
        <Column field="Name" header="Наименование модуля">
          <template #body="slotProps">
            <Button :label="slotProps.data.Name" class="p-button-link" @click="Link(slotProps.data.module)"/>
          </template>
        </Column>
      </DataTable>
      <!--<Logo />
      <Toast />
      
      <form @submit.prevent="greet">
          <InputText type="text" v-model="text"/>
          <Button type="submit" label="Submit"/>
      </form>-->
     
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //text: null,
      FormData: {},
      messages: [],
    };
  },
  async mounted() {
    const UserAuthID = localStorage.getItem("UserAuthID");
    const config = { params: { UserAuthID } };
    const answer = await this.$axios.$get("api", config);
    if (answer.Error == "Token is expired") this.$router.push("/auth");
    if (answer.Error)
      this.messages = [{ severity: "error", content: answer.Error }];

    this.FormData = answer;
    /*
    this.rows = answer.Entity.map((row) => {
      //console.log('row=',row);
      return {
        id: row.id,
        Name: row.Name,
        link: "/" + row.module,
      };
    });*/
  },
  /*async asyncData({ app }) {
    const UserAuthID = localStorage.getItem("UserAuthID");
    const config = { params: { UserAuthID } };
    const moduleList = await app.$axios.$get("api", config);
    //console.log("moduleList=", moduleList);
    const rows = moduleList.Entity.map((row) => {
      //console.log('row=',row);
      return {
        id: row.id,
        Name: '<a href="/' + row.module + '">' + row.Name + "</a>",
      };
    });
    //console.log('rows=',rows);
    return { rows };
  },*/
  methods: {
    Link(module) {
      //console.log("link=", link);
      return this.$router.push("/modules/" + module);
      //this.$toast.add({ severity: "info", summary: "Hello " + this.text });
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
