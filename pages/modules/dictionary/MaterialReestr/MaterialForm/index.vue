<template>
  <div>
    <Toolbar>
      <template #left>
        <Button label="Выйти" icon="pi pi-times" @click="clickExit()"/>
        <i class="pi pi-bars p-toolbar-separator p-mr-2" />
        <Button label="Сохранить" icon="pi pi-check" @click="clickSave()" class="p-button-success"/>
      </template>
    </Toolbar>
    <transition-group name="p-messages" tag="div">
      <Message v-for="msg of messages" :life="3000" :sticky="false" :severity="msg.severity" :key="msg.content">{{msg.content}}</Message>
    </transition-group>
    <div class="p-fluid">    
      <div class="p-field p-grid">
          <label for="name" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Наименование</label>
          <div class="p-col-12 p-md-10">
            <InputText id="name" type="text" v-model="FormData.DocMovement.Name"/>
          </div>
      </div>
      <div class="p-field p-grid">
          <label for="description" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Описание</label>
          <div class="p-col-12 p-md-10">          
            <Textarea id="description" v-model="FormData.DocMovement.Description" :autoResize="true" rows="5" cols="30" />
          </div>
      </div>      
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      FormData: {
        DocMovement: {},
      },
      messages: [],
    };
  },
  async mounted() {
    let config = {
      params: {
        module: "dictionary",
        form: "MaterialForm",
        id: this.$route.query.id,
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
      this.$router.push("/modules/dictionary/MaterialReestr");
    },
    async clickSave() {
      const formData = {
        module: "dictionary",
        form: "MaterialForm",
        UserAuthID: localStorage.getItem("UserAuthID"),
        data: this.$data.FormData,
      };
      const answer = await this.$axios.$post("api", formData);
      if (answer.Error)
        this.$data.messages = [{ severity: "error", content: answer.Error }];
      else
        this.$data.messages = [
          { severity: "success", content: "Документ сохранён" },
        ];
    },
  },
};
</script>