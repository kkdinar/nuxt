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
      <div class="p-field p-grid">
          <label for="adress" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Адрес</label>
          <div class="p-col-12 p-md-10">
            <InputText id="adress" type="text" v-model="FormData.DocMovement.Adress"/>
          </div>
      </div>
      <div class="p-field p-grid">
          <label for="telefon" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Телефон</label>
          <div class="p-col-12 p-md-10">
            <InputText id="telefon" type="text" v-model="FormData.DocMovement.Telefon"/>
          </div>
      </div>
      <div class="p-field p-grid">
          <label for="сategory" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Категория Контрагента</label>
          <div class="p-col-12 p-md-10">
            <AutoComplete id="сategory" v-model="selectedCategory" :suggestions="filteredCategory" @complete="searchCategory($event)" :dropdown="true" field="Name" forceSelection>
              <template #item="slotProps">
                <div class="country-item">
                  <div>{{slotProps.item.Name}}</div>
                </div>
              </template>
            </AutoComplete>
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
      filteredCategory: null,
      Categories: [],
      selectedCategory: null,
      messages: [],
    };
  },
  async mounted() {
    let config = {
      params: {
        module: "dictionary",
        form: "ContractorForm",
        id: this.$route.query.id,
        UserAuthID: localStorage.getItem("UserAuthID"),
      },
    };
    const answer = await this.$axios.$get("api", config);
    if (answer.Error == "Token is expired") this.$router.push("/auth");
    if (answer.Error)
      this.messages = [{ severity: "error", content: answer.Error }];

    this.FormData = answer;
    this.selectedCategory = answer.DocMovement.Category_Name;
    this.Categories.push({
      id: answer.DocMovement.Category_id,
      Name: answer.DocMovement.Category_Name,
    });
  },
  methods: {
    async searchCategory(event) {
      //Если в справочнике всего 1 значение - значит справочник загружен не полностью
      if (!this.$data.Categories[1]) {
        const config = {
          params: {
            module: "dictionary",
            form: "Category",
            UserAuthID: localStorage.getItem("UserAuthID"),
          },
        };
        const answer = await this.$axios.$get("api", config);
        if (answer.Error)
          this.$data.messages = [{ severity: "error", content: answer.Error }];
        this.$data.Categories = answer.Entity;
      }

      setTimeout(() => {
        if (!event.query.trim().length) {
          this.$data.filteredCategory = [...this.$data.Categories];
        } else {
          this.$data.filteredCategory = this.$data.Categories.filter((row) => {
            return row.Name.toLowerCase().startsWith(event.query.toLowerCase());
          });
        }
      }, 250);
    },
    clickExit() {
      this.$router.push("/modules/dictionary/ContractorReestr");
    },
    async clickSave() {
      //console.log('selectedCategory=',this.$data.selectedCategory);
      this.$data.FormData.DocMovement.Category_id = (this.$data.selectedCategory || {}).id;
      this.$data.FormData.DocMovement.Category_Name = (this.$data.selectedCategory || {}).Name;
      const formData = {
        module: "dictionary",
        form: "ContractorForm",
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