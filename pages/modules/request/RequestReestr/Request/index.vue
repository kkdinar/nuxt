<template>
  <div>
    <Toolbar>
      <template #left>
        <Button label="Выйти" icon="pi pi-times" @click="clickExit()"/>
        <i class="pi pi-bars p-toolbar-separator p-mr-2" />
        <Button label="Сохранить" icon="pi pi-save" @click="clickSave()" class="p-button-success"/>
      </template>
    </Toolbar>
    <transition-group name="p-messages" tag="div">
      <Message v-for="msg of messages" :life="3000" :sticky="false" :severity="msg.severity" :key="msg.content">{{msg.content}}</Message>
    </transition-group>
    <div class="p-fluid p-formgrid p-grid">
      <div class="p-field p-col-12 p-md-6">
        <label for="id">Номер</label>
        <InputText id="id" type="text" v-model="FormData.DocMovement.id" disabled="true" />
      </div>
      <div class="p-field p-col-12 p-md-6">
        <label for="Date">Дата</label>
        <Calendar id="Date" v-model="FormData.DocMovement.Date" :locale="Ru" :showIcon="true" dateFormat="dd.mm.yy"/>
      </div> 
      <div class="p-field">
        <label for="name" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Наименование</label>        
        <InputText id="name" type="text" v-model="FormData.DocMovement.Name"/>
      </div>
      <div class="p-field">
        <label for="description" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Описание</label>
        <Textarea id="description" v-model="FormData.DocMovement.Description" :autoResize="true" rows="5" cols="30" />
      </div>
      <div class="p-field">
        <label for="Contractor">Контрагент</label>
        <AutoComplete id="Contractor" v-model="selectedContractor" :suggestions="filteredContractors" @complete="searchContractor($event)" :dropdown="true" field="Name" forceSelection>
          <template #item="slotProps">
            <div>{{slotProps.item.Name}}</div>
          </template>
        </AutoComplete>
      </div>
      <div class="p-field">
        <label for="Storage">Склад</label>
        <AutoComplete id="Storage" v-model="selectedStorage" :suggestions="filteredStorages" @complete="searchStorage($event)" :dropdown="true" field="Name" forceSelection>
          <template #item="slotProps">
            <div>{{slotProps.item.Name}}</div>
          </template>
        </AutoComplete>
      </div>
    </div> 
    <div>
      <label>----------</label>
    </div>
    <Toolbar class="p-mb-4">
      <template #left>
        <Button label="Создать" icon="pi pi-plus" class="p-button-success p-mr-2" @click="newRow" />
        <Button label="Удалить" icon="pi pi-trash" class="p-button-danger" @click="deleteSelectedRow" :disabled="!selectedRows || !selectedRows.length" />
      </template>
    </Toolbar>
    <DataTable :value="FormData.Entity" :selection.sync="selectedRows" dataKey="id" editMode="cell" class="p-datatable-gridlines">
      <Column selectionMode="multiple" headerStyle="width: 3em"></Column>
      <Column field="id" header="Код" headerStyle="width: 5em"></Column>
      <Column field="RequestStatus_id" header="Статус">
        <template #editor="slotProps">
          <Dropdown v-model="slotProps.data['RequestStatus_id']" @input="onCellRequestStatusEdit($event, slotProps)" :options="RequestStatuses" optionLabel="Name" optionValue="id" placeholder="Выберите статус">
            <template #option="slotProps">
              <span :class="'product-badge status-' + slotProps.option.Name.toLowerCase()">{{slotProps.option.Name}}</span>
            </template>
          </Dropdown>
        </template>
        <template #body="slotProps">
          {{slotProps.data.RequestStatus_Name}}
        </template>
      </Column>
      <Column field="User_id" header="Ответственный">
        <template #editor="slotProps">
          <AutoComplete v-model="slotProps.data['User_id']" :suggestions="filteredUsers" @complete="searchUser($event)" @input="onCellUserEdit($event, slotProps)" :dropdown="true" field="Name" forceSelection>
            <template #item="slotProps">
              <div>{{slotProps.item.Name}}</div>
            </template>
          </AutoComplete>
        </template>
        <template #body="slotProps">
          {{slotProps.data.User_Name}}
        </template>
      </Column>
      <Column header="Вложения" headerStyle="width: 7em">
        <template #body="slotProps">
          <Button icon="pi pi-folder-open" @click="clickAttachment(slotProps)"/>
        </template>
      </Column>
      <Column field="DateBegin" header="Дата начала">
        <template #editor="slotProps">
          <Calendar v-model="slotProps.data['DateBegin']" :locale="Ru" :showIcon="true" dateFormat="dd.mm.yy"/>
        </template>
        <template #body="slotProps">
          {{getDate(slotProps.data.DateBegin)}}
        </template>
      </Column>
      <Column field="DateEnd" header="Дата окончания">
        <template #editor="slotProps">
          <Calendar v-model="slotProps.data['DateEnd']" :locale="Ru" :showIcon="true" dateFormat="dd.mm.yy"/>
        </template>
        <template #body="slotProps">
          {{getDate(slotProps.data.DateEnd)}}
        </template>
      </Column>
    </DataTable>  
  </div>
</template>

<script>
export default {
  data() {
    return {
      FormData: {
        DocMovement: {},
        Entity: [],
      },
      messages: [],
      selectedRows: null,
      selectedContractor: null,
      filteredContractors: null,
      Contractors: [],
      selectedStorage: null,
      filteredStorages: null,
      Storages: [],
      RequestStatuses: [],
      Users: [],
      filteredUsers: null,
      Ru: {
        firstDayOfWeek: 0,
        dayNames: [
          "Понедельник",
          "Вторник",
          "Среда",
          "Четверг",
          "Пятница",
          "Суббота",
          "Воскресенье",
        ],
        dayNamesShort: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
        dayNamesMin: ["П", "В", "С", "Ч", "П", "С", "В"],
        monthNames: [
          "Январь",
          "Февраль",
          "Март",
          "Апрель",
          "Май",
          "Июнь",
          "Июль",
          "Август",
          "Сентябрь",
          "Октябрь",
          "Ноябрь",
          "Декабрь",
        ],
        monthNamesShort: [
          "Янв",
          "Фев",
          "Мар",
          "Апр",
          "Май",
          "Июн",
          "Июл",
          "Авг",
          "Сен",
          "Окт",
          "Нояб",
          "Дек",
        ],
        today: "Сегодня",
        clear: "Очистить",
        //weekHeader: "Sm",
        dateFormat: "dd.mm.yy",
      },
    };
  },
  async mounted() {
    let config = {
      params: {
        module: "request",
        form: "Request",
        id: this.$route.query.id,
        UserAuthID: localStorage.getItem("UserAuthID"),
      },
    };
    let answer = await this.$axios.$get("api", config);
    if (answer.Error == "Token is expired") this.$router.push("/auth");
    if (answer.Error)
      this.messages = [{ severity: "error", content: answer.Error }];
    else {
      if (!answer.DocMovement.Date) answer.DocMovement.Date = new Date();
      else answer.DocMovement.Date = this.getDate(answer.DocMovement.Date);
      if (answer.DocMovement.Contractor_id) {
        this.selectedContractor = {
          id: answer.DocMovement.Contractor_id,
          Name: answer.DocMovement.Contractor_Name,
        };
      } else this.selectedContractor = [];
      if (answer.DocMovement.Storage_id) {
        this.selectedStorage = {
          id: answer.DocMovement.Storage_id,
          Name: answer.DocMovement.Storage_Name,
        };
      } else this.selectedStorage = [];
      this.FormData = answer;

      config = {
        params: {
          module: "dictionary",
          form: "RequestStatus",
          UserAuthID: localStorage.getItem("UserAuthID"),
        },
      };
      answer = await this.$axios.$get("api", config);
      if (answer.Error)
        this.messages = [{ severity: "error", content: answer.Error }];
      else this.RequestStatuses = answer.Entity;

      config = {
        params: {
          module: "dictionary",
          form: "UserForm",
          UserAuthID: localStorage.getItem("UserAuthID"),
        },
      };
      answer = await this.$axios.$get("api", config);
      if (answer.Error)
        this.messages = [{ severity: "error", content: answer.Error }];
      else this.Users = answer.Entity;
    }
  },
  methods: {
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
    async searchStorage(event) {
      if (!this.$data.Storages[0]) {
        const config = {
          params: {
            module: "dictionary",
            form: "StorageForm",
            UserAuthID: localStorage.getItem("UserAuthID"),
          },
        };
        const answer = await this.$axios.$get("api", config);
        if (answer.Error)
          this.$data.messages = [{ severity: "error", content: answer.Error }];
        else this.$data.Storages = answer.Entity;
      }

      setTimeout(() => {
        if (!event.query.trim().length) {
          this.filteredStorages = [...this.Storages];
        } else {
          this.filteredStorages = this.Storages.filter((storage) => {
            return storage.Name.toLowerCase().startsWith(
              event.query.toLowerCase()
            );
          });
        }
      }, 250);
    },
    async searchUser(event) {
      //console.log('event=',event);
      setTimeout(() => {
        if (!event.query.trim().length) {
          this.filteredUsers = [...this.Users];
        } else {
          this.filteredUsers = this.Users.filter((user) => {
            return user.Name.toLowerCase().startsWith(
              event.query.toLowerCase()
            );
          });
        }
      }, 250);
    },
    onCellRequestStatusEdit(newValue, props) {
      const RequestStatus = this.$data.RequestStatuses.find(
        (r) => r.id == newValue
      );
      this.$data.FormData.Entity[props.index].RequestStatus_Name = (
        RequestStatus || {}
      ).Name;
    },
    onCellUserEdit(newValue, props) {
      const User = this.$data.Users.find((r) => r.id == newValue.id);
      this.$data.FormData.Entity[props.index].User_Name = (User || {}).Name;
    },
    getDate(d) {
      if (!d) return "";
      const date = new Date(d);
      let month = date.getMonth() + 1;
      if (month < 10) month = "0" + month;
      return date.getDate() + "." + month + "." + date.getFullYear();
    },
    clickAttachment(slotProps) {
      //console.log("slotProps=", slotProps);
      this.$router.push(
        "/modules/attachment" +
          "?backURL=/modules/request/RequestReestr/Request?id=" +
          this.$data.FormData.DocMovement.id +
          "&module=request" +
          "&form=RequestEntity" +
          //"&DocMovement_id=" + this.$data.FormData.DocMovement.id +
          "&id=" +
          slotProps.data.id
      );
    },
    clickExit() {
      this.$router.push("/modules/request/RequestReestr");
    },
    async clickSave() {
      this.$data.FormData.DocMovement.Contractor_id = (
        this.$data.selectedContractor || {}
      ).id;
      this.$data.FormData.DocMovement.Contractor_Name = (
        this.$data.selectedContractor || {}
      ).Name;
      this.$data.FormData.DocMovement.Storage_id = (
        this.$data.selectedStorage || {}
      ).id;
      this.$data.FormData.DocMovement.Storage_Name = (
        this.$data.selectedStorage || {}
      ).Name;
      this.$data.FormData.Entity.forEach((row) => {
        //console.log('row=',row);
        row.User_id = (row.User_id || {}).id;
      });
      const formData = {
        module: "request",
        form: "Request",
        UserAuthID: localStorage.getItem("UserAuthID"),
        data: this.$data.FormData,
      };
      //console.log("formData=", this.$data.FormData);
      const answer = await this.$axios.$post("api", formData);
      if (answer.Error) {
        this.$data.messages = [{ severity: "error", content: answer.Error }];
      } else {
        this.$data.messages = [
          { severity: "success", content: "Документ сохранён" },
        ];
      }
    },
    async newRow() {
      const formData = {
        module: "request",
        form: "Request",
        UserAuthID: localStorage.getItem("UserAuthID"),
        data: {
          Entity: [
            {
              Parent: this.$data.FormData.DocMovement.id,
            },
          ],
        },
      };
      //console.log("formData=", formData);
      const answer = await this.$axios.$post("api", formData);
      if (answer.Error) {
        this.$data.messages = [{ severity: "error", content: answer.Error }];
      } else {
        this.$data.FormData.Entity.push(answer.Entity);
      }
      //window.location.reload();
    },
    async deleteSelectedRow() {
      //console.log("selectedRows=", this.$data.selectedRows);
      const formData = {
        data: {
          module: "request",
          form: "Request",
          data: {
            Entity: this.$data.selectedRows,
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
