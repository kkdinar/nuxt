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
        <label for="Contractor">Организация пользователя</label>
        <AutoComplete id="Contractor" v-model="selectedContractor" :suggestions="filteredContractors" @complete="searchContractor($event)" :dropdown="true" field="Name" forceSelection>
          <template #item="slotProps">
            <div>{{slotProps.item.Name}}</div>
          </template>
        </AutoComplete>
      </div>
      <div class="p-field p-grid">
          <label for="staffJob" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Должность</label>
          <div class="p-col-12 p-md-10">
            <AutoComplete id="staffJob" v-model="selectedStaffJob" :suggestions="filteredStaffJob" @complete="searchStaffJob($event)" :dropdown="true" field="Name" forceSelection>
              <template #item="slotProps">
                <div class="country-item">
                  <div>{{slotProps.item.Name}}</div>
                </div>
              </template>
            </AutoComplete>
          </div>
      </div>
      <div class="p-field p-grid">
          <label for="login" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Логин</label>
          <div class="p-col-12 p-md-10">
            <InputText id="login" type="text" v-model="FormData.DocMovement.Login"/>
          </div>
      </div>
      <div class="p-field p-grid">
          <label for="password" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Пароль</label>
          <div class="p-col-12 p-md-10">
            <Password id="password" v-model="FormData.DocMovement.Password" :feedback="false" toggleMask></Password> 
            <!--<InputText id="password" type="text" v-model="FormData.DocMovement.Password"/>-->
          </div>
      </div>
      <div class="p-field p-grid">
          <label for="email" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Почта</label>
          <div class="p-col-12 p-md-10">
            <InputText id="email" type="text" v-model="FormData.DocMovement.Email"/>
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
      filteredStaffJob: null,
      StaffJobs: [],
      selectedStaffJob: null,
      messages: [],
      selectedContractor: null,
      filteredContractors: null,
      Contractors: [],
    };
  },
  async mounted() {
    //console.log("this.$route.query.id=", this.$route.query.id);
    let config = {
      params: {
        module: "dictionary",
        form: "UserForm",
        id: this.$route.query.id,
        UserAuthID: localStorage.getItem("UserAuthID"),
      },
    };
    const answer = await this.$axios.$get("api", config);
    if (answer.Error == "Token is expired") this.$router.push("/auth");
    if (answer.Error)
      this.messages = [{ severity: "error", content: answer.Error }];

    this.FormData = answer;
    //console.log("this.FormData=", this.FormData);
    if (answer.DocMovement.StaffJob_id) {
      this.selectedStaffJob = {
        id: answer.DocMovement.StaffJob_id,
        Name: answer.DocMovement.StaffJob_Name,
      };
      this.StaffJobs.push({
        id: answer.DocMovement.StaffJob_id,
        Name: answer.DocMovement.StaffJob_Name,
      });
    }
    if (answer.DocMovement.Contractor_id) {
      this.selectedContractor = {
        id: answer.DocMovement.Contractor_id,
        Name: answer.DocMovement.Contractor_Name,
      };
    }
  },
  methods: {
    async searchStaffJob(event) {
      //Если в справочнике всего 1 значение - значит справочник загружен не полностью
      if (!this.$data.StaffJobs[1]) {
        const config = {
          params: {
            module: "dictionary",
            form: "StaffJob",
            UserAuthID: localStorage.getItem("UserAuthID"),
          },
        };
        const answer = await this.$axios.$get("api", config);
        if (answer.Error)
          this.$data.messages = [{ severity: "error", content: answer.Error }];
        this.$data.StaffJobs = answer.Entity;
      }

      setTimeout(() => {
        if (!event.query.trim().length) {
          this.$data.filteredStaffJob = [...this.$data.StaffJobs];
        } else {
          this.$data.filteredStaffJob = this.$data.StaffJobs.filter((job) => {
            return job.Name.toLowerCase().startsWith(event.query.toLowerCase());
          });
        }
      }, 250);
    },
    async searchContractor(event) {
      if (!this.$data.Contractors[0]) {
        const config = {
          params: {
            module: "dictionary",
            form: "ContractorForm",
            UserAuthID: localStorage.getItem("UserAuthID"),
          },
        };
        const answer = await this.$axios.$get("api", config);
        if (answer.Error)
          this.$data.messages = [{ severity: "error", content: answer.Error }];
        else this.$data.Contractors = answer.Entity;
      }

      setTimeout(() => {
        if (!event.query.trim().length) {
          this.filteredContractors = [...this.Contractors];
        } else {
          this.filteredContractors = this.Contractors.filter((contractor) => {
            return contractor.Name.toLowerCase().startsWith(
              event.query.toLowerCase()
            );
          });
        }
      }, 250);
    },
    clickExit() {
      this.$router.push("/modules/dictionary/UserReestr");
    },
    async clickSave() {
      this.$data.FormData.DocMovement.StaffJob_id = (
        this.$data.selectedStaffJob || {}
      ).id;
      this.$data.FormData.DocMovement.StaffJob_Name = (
        this.$data.selectedStaffJob || {}
      ).Name;
      this.$data.FormData.DocMovement.Contractor_id = (
        this.$data.selectedContractor || {}
      ).id;
      this.$data.FormData.DocMovement.Contractor_Name = (
        this.$data.selectedContractor || {}
      ).Name;
      const formData = {
        module: "dictionary",
        form: "UserForm",
        UserAuthID: localStorage.getItem("UserAuthID"),
        data: this.$data.FormData,
      };
      //console.log("formData=", formData);
      const answer = await this.$axios.$post("api", formData);
      //console.log("answer=", answer);
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