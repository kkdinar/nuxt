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
      <label>----------</label>
      <div class="p-field p-col-12 p-md-6">
        <label for="Active">Рассылка активна</label>
        <Checkbox id="Active" v-model="FormData.DocMovement.Active" :binary="true" />
      </div>
      <label>----------</label>
      <div class="p-field p-col-12 p-md-6">
        <label for="Subject">Тема</label>
        <InputText id="Subject" type="text" v-model="FormData.DocMovement.Subject" v-bind:class="classSubject"/>
      </div>
      <div class="p-field">
        <label for="Text" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Текст</label>
        <Textarea id="Text" v-model="FormData.DocMovement.Text" :autoResize="true" rows="5" cols="30" v-bind:class="classText"/>
      </div>
      <div class="p-field">
        <label for="description" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Описание</label>
        <Textarea id="description" v-model="FormData.DocMovement.Description" :autoResize="true" rows="5" cols="30" />
      </div>
     
      <div class="p-field p-col-12 p-md-6">
          <label for="Period">Периодичность отправки</label>
          <Dropdown id="Period" v-model="selectedPeriod" :options="Periods" optionLabel="Name" @input="onPeriodEdit($event, slotProps)" v-bind:class="classPeriod" />
      </div>
      <div v-if="showWeekDays" class="p-field p-col-12 p-md-6">
          <label for="WeekDay">День недели</label>
          <Dropdown id="WeekDay" v-model="selectedWeekDay" :options="WeekDays" optionLabel="Name"/>
      </div>
      <div class="p-field p-col-12 p-md-6">
        <label for="Time">Время</label>
        <Calendar id="Time" v-model="FormData.DocMovement.Time" :inline="true" :showTime="true" :locale="ru" :showIcon="true" dateFormat="dd.mm.yy" />
      </div>
      <div class="p-field p-col-12 p-md-6">
          <label for="SendingMethod">Способ отправки</label>
          <Dropdown id="SendingMethod" v-model="selectedSendingMethod" :options="SendingMethods" optionLabel="Name" v-bind:class="classSendingMethod"/>
      </div>
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
      <Column field="Type" header="Тип рассылки">
        <template #editor="slotProps">
          <Dropdown v-model="slotProps.data['Type']" :options="Types" optionLabel="Name" optionValue="Type" placeholder="Выберите тип">
            <template #option="slotProps">
              <span :class="'product-badge status-' + slotProps.option.Name.toLowerCase()">{{slotProps.option.Name}}</span>
            </template>
          </Dropdown>
        </template>
        <template #body="slotProps">
          {{getTypeName(slotProps.data.Type)}}
        </template>
      </Column>
      <Column field="User_id" header="Пользователь">
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
      <Column field="InformGroup_id" header="Группа рассылки">
        <template #editor="slotProps">
          <AutoComplete v-model="slotProps.data['InformGroup_id']" :suggestions="filteredInformGroups" @complete="searchInformGroup($event)" @input="onCellInformGroupEdit($event, slotProps)" :dropdown="true" field="Name" forceSelection>
            <template #item="slotProps">
              <div>{{slotProps.item.InformGroup}}</div>
            </template>
          </AutoComplete>
        </template>
        <template #body="slotProps">
          {{slotProps.data.InformGroup_Name}}
        </template>
      </Column>
     
    </DataTable>  
  </div>
</template>

<script>
export default {
  data() {
    return {
      ru: {
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
        weekHeader: "Пн",
        dateFormat: "dd.mm.yy",
      },
      FormData: {
        DocMovement: {},
        Entity: [],
      },
      messages: [],
      selectedRows: null,
      selectedPeriod: null,
      Periods: [
        { id: 1, Name: "Однократно" },
        { id: 2, Name: "Ежедневно" },
        { id: 3, Name: "Еженедельно" },
        { id: 4, Name: "Ежемесячно" },
        { id: 5, Name: "Ежегодно" },
      ],
      selectedWeekDay: null,
      WeekDays: [
        { id: 1, Name: "Понедельник" },
        { id: 2, Name: "Вторник" },
        { id: 3, Name: "Среда" },
        { id: 4, Name: "Четверг" },
        { id: 5, Name: "Пятница" },
        { id: 6, Name: "Суббота" },
        { id: 7, Name: "Воскресенье" },
      ],
      selectedSendingMethod: null,
      SendingMethods: [{ Name: "Email" }, { Name: "Telegram" }],
      Types: [
        { id: 1, Name: "Индивидуальная", Type: "personal" },
        { id: 2, Name: "Групповая", Type: "group" },
      ],
      Users: [],
      filteredUsers: null,
      InformGroups: [],
      filteredInformGroups: null,
      showWeekDays: false,
    };
  },
  async mounted() {
    let config = {
      params: {
        module: "informing",
        form: "Inform",
        id: this.$route.query.id,
        UserAuthID: localStorage.getItem("UserAuthID"),
      },
    };
    let answer = await this.$axios.$get("api", config);
    if (answer.Error == "Token is expired") this.$router.push("/auth");
    if (answer.Error)
      this.messages = [{ severity: "error", content: answer.Error }];
    else {
      if (answer.DocMovement.Period_id) {
        this.selectedPeriod = {
          id: answer.DocMovement.Period_id,
          Name: answer.DocMovement.Period_Name,
        };
      }
      if (answer.DocMovement.WeekDay_id) {
        this.selectedWeekDay = {
          id: answer.DocMovement.WeekDay_id,
          Name: answer.DocMovement.WeekDay_Name,
        };
      } else this.selectedWeekDay = [];
      if (answer.DocMovement.SendingMethod)
        this.selectedSendingMethod = { Name: answer.DocMovement.SendingMethod };

      this.FormData = answer;
    }
  },
  computed: {
    classSubject: function () {
      return {
        "p-invalid": this.FormData.DocMovement.Subject ? false : true,
      };
    },
    classText: function () {
      return {
        "p-invalid": this.FormData.DocMovement.Text ? false : true,
      };
    },
    classPeriod: function () {
      return {
        "p-invalid": this.selectedPeriod ? false : true,
      };
    },
    classSendingMethod: function () {
      return {
        "p-invalid": this.selectedSendingMethod ? false : true,
      };
    },
  },
  methods: {
    async searchUser(event) {
      if (!this.$data.Users[0]) {
        const config = {
          params: {
            module: "dictionary",
            form: "UserReestr",
            UserAuthID: localStorage.getItem("UserAuthID"),
          },
        };
        const answer = await this.$axios.$get("api", config);
        if (answer.Error)
          this.$data.messages = [{ severity: "error", content: answer.Error }];
        else this.$data.Users = answer.Entity;
      }

      setTimeout(() => {
        if (!event.query.trim().length) {
          this.filteredUsers = [...this.Users];
        } else {
          this.filteredUsers = this.Users.filter((row) => {
            return row.Name.toLowerCase().startsWith(event.query.toLowerCase());
          });
        }
      }, 250);
    },
    onPeriodEdit(newValue, props) {
      if (newValue.Name == "Однократно") this.$data.showWeekDays = false;
      if (newValue.Name == "Ежедневно") this.$data.showWeekDays = false;
      if (newValue.Name == "Еженедельно") this.$data.showWeekDays = true;
      if (newValue.Name == "Ежемесячно") this.$data.showWeekDays = false;
      if (newValue.Name == "Ежегодно") this.$data.showWeekDays = false;
    },
    getTypeName(Type) {
      let Name = "";
      if (Type == "personal") Name = "Индивидуальная";
      if (Type == "group") Name = "Групповая";
      return Name;
    },
    onCellUserEdit(newValue, props) {
      const User = this.$data.Users.find((r) => r.id == newValue.id);
      this.$data.FormData.Entity[props.index].User_Name = (User || {}).Name;
    },
    searchInformGroup() {},
    clickExit() {
      this.$router.push("/modules/informing/InformReestr");
    },
    async clickSave() {
      this.$data.FormData.DocMovement.Period_id = (
        this.$data.selectedPeriod || {}
      ).id;
      this.$data.FormData.DocMovement.Period_Name = (
        this.$data.selectedPeriod || {}
      ).Name;
      this.$data.FormData.DocMovement.WeekDay_id = (
        this.$data.selectedWeekDay || {}
      ).id;
      this.$data.FormData.DocMovement.WeekDay_Name = (
        this.$data.selectedWeekDay || {}
      ).Name;
      this.$data.FormData.DocMovement.SendingMethod = (
        this.selectedSendingMethod || {}
      ).Name;
      this.$data.FormData.Entity.forEach((row) => {
        //console.log('row=',row);
        row.User_id = (row.User_id || {}).id;
      });
      if (!this.$data.FormData.DocMovement.Time)
        this.$data.FormData.DocMovement.Time = new Date();
      const formData = {
        module: "informing",
        form: "Inform",
        UserAuthID: localStorage.getItem("UserAuthID"),
        data: this.$data.FormData,
      };
      //console.log("formData=", this.$data.FormData);
      //console.log("formData=", this.$data.FormData.DocMovement.Time);
      const answer = await this.$axios.$post("api", formData);
      if (answer.Error)
        this.$data.messages = [{ severity: "error", content: answer.Error }];
      else
        this.$data.messages = [
          { severity: "success", content: "Документ сохранён" },
        ];
    },
    async newRow() {
      const formData = {
        module: "informing",
        form: "Inform",
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
      if (answer.Error)
        this.$data.messages = [{ severity: "error", content: answer.Error }];
      else {
        if (!this.$data.FormData.Entity[0]) this.$data.FormData.Entity = [];
        this.$data.FormData.Entity.push(answer.Entity);
      }
      //window.location.reload();
    },
    async deleteSelectedRow() {
      //console.log("selectedRows=", this.$data.selectedRows);
      const formData = {
        data: {
          module: "informing",
          form: "Inform",
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
