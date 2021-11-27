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
        <label for="user" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Пользователь</label>
        <div class="p-col-12 p-md-10">
          <InputText id="user" type="text" v-model="FormData.DocMovement.User_Name" disabled="true"/>
        </div>
      </div>
      <div class="p-field p-grid">
        <label for="moduleName" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Модуль</label>
        <div class="p-col-12 p-md-10">
          <InputText id="moduleName" type="text" v-model="FormData.DocMovement.ModuleName" disabled="true"/>
        </div>
      </div>
      <div class="p-field p-grid">
        <label for="form_Name" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Форма</label>
        <div class="p-col-12 p-md-10">
          <InputText id="form_Name" type="text" v-model="FormData.DocMovement.Form_Name" disabled="true"/>
        </div>
      </div>
      <div class="p-field p-grid">
        <label for="active" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">Фильтрация включена</label>
        <div class="p-col-12 p-md-10">
          <Checkbox  id="active" v-model="FormData.DocMovement.Active" :binary="true"/>
        </div>
      </div>
      <div>
        <label>----------</label>
      </div>
      <Toolbar class="p-mb-4">
        <template #left>
          <Button label="Создать" icon="pi pi-plus" class="p-button-success p-mr-2" @click="openNew" />
          <Button label="Удалить" icon="pi pi-trash" class="p-button-danger" @click="deleteSelectedRow" :disabled="!selectedRows || !selectedRows.length" />
        </template>
      </Toolbar>
      <DataTable :value="FormData.Entity" :selection.sync="selectedRows" dataKey="id" editMode="cell" class="p-datatable-gridlines" >
        <Column selectionMode="multiple" headerStyle="width: 3em"></Column>
        <Column field="id" header="Код" headerStyle="width: 5em"></Column>
        <Column field="Column_Name" header="Поле" >
          <template #editor="slotProps">
          <AutoComplete v-model="slotProps.data['Column_Name']" :suggestions="filteredColumn_Name" @complete="searchColumn_Name($event)" :dropdown="true" forceSelection>
            <template #item="slotProps">
              <div>{{slotProps.item}}</div>
            </template>
          </AutoComplete>
          </template>
          <template #body="slotProps">
            {{slotProps.data.Column_Name}}
          </template>
        </Column>
        <Column field="Operation" header="Операция">
          <template #editor="slotProps">
            <Dropdown v-model="slotProps.data['Operation']" @input="onCellEdit($event, slotProps)" :options="Operations" optionLabel="Name" optionValue="Label" placeholder="Выберите операция">
              <template #option="slotProps">
                <span :class="'product-badge status-' + slotProps.option.Label.toLowerCase()">{{slotProps.option.Name}}</span>
              </template>
            </Dropdown>
          </template>
          <template #body="slotProps">
            {{getOperationLabel(slotProps.data.Operation)}}
          </template>
        </Column>
        <Column field="Column_Value" header="Значение">
          <template #editor="slotProps">
            <!--<InputText v-model="slotProps.data[slotProps.column.field]" />-->
            <AutoComplete v-model="slotProps.data['Column_Value']" :suggestions="filteredColumn_Value" @complete="searchColumn_Value($event)" :dropdown="true" forceSelection field="Name">
              <template #item="slotProps">
                <div>{{slotProps.item.Name}}</div>
              </template>
            </AutoComplete>
          </template>
          <template #body="slotProps">
            {{slotProps.data.Column_Value}}
          </template>
        </Column>
        <Column field="Name" header="Описание правила">
          <template #editor="slotProps">
            <InputText v-model="slotProps.data[slotProps.column.field]" />
          </template>
        </Column>
      </DataTable> 
    </div>
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
      filteredColumn_Name: null,
      filteredColumn_Value: null,
      ColumnNames: [],
      ColumnValues: [],
      Operations: [
        { Name: "Равно", Label: "=" },
        { Name: "Не равно", Label: "<>" },
        { Name: "Меньше", Label: "<" },
        { Name: "Больше", Label: ">" },
        { Name: "Меньше или равно", Label: "<=" },
        { Name: "Больш или равно", Label: ">=" },
      ],
      editingCellRows: {},
      selectedRows: null,
    };
  },
  async mounted() {
    let config = {
      params: {
        module: "userdocright",
        form: "UserDataRight",
        id: this.$route.query.id,
        UserAuthID: localStorage.getItem("UserAuthID"),
      },
    };
    let answer = await this.$axios.$get("api", config);
    if (answer.Error == "Token is expired") this.$router.push("/auth");
    if (answer.Error)
      this.messages = [{ severity: "error", content: answer.Error }];
    else this.FormData = answer;

    //Собираем назания полей формы, не знаем id существующего документа
    //Пока только для Заявок, фильтр по Контрагенту
    const module = this.FormData.DocMovement.ModuleName;
    const form = this.FormData.DocMovement.Form_Name;
    if (module == "request" && (form == "Request"||form == "RequestReestr")) {
      config = {
        params: {
          module: "dictionary",
          form: "ContractorForm",
          UserAuthID: localStorage.getItem("UserAuthID"),
        },
      };
      answer = await this.$axios.$get("api", config);
      if (answer.Error)
        this.messages = [{ severity: "error", content: answer.Error }];
      else {
        //if (answer.Entity[0]) this.ColumnNames = Object.keys(answer.Entity[0]);
        if (answer.Entity[0])
          answer.Entity.forEach((row) => {
            this.ColumnValues.push({ id: row.id, Name: row.Name });
          });
        this.ColumnNames = ["Contractor"];
      }
    }
  },
  methods: {
    async searchColumn_Name(event) {
      setTimeout(() => {
        if (!event.query.trim().length) {
          this.filteredColumn_Name = [...this.ColumnNames];
        } else {
          this.filteredColumn_Name = this.ColumnNames.filter((row) => {
            return row.Name.toLowerCase().startsWith(event.query.toLowerCase());
          });
        }
      }, 250);
    },
    async searchColumn_Value(event) {
      setTimeout(() => {
        if (!event.query.trim().length) {
          this.filteredColumn_Value = [...this.ColumnValues];
        } else {
          this.filteredColumn_Value = this.ColumnValues.filter((row) => {
            return row.Name.toLowerCase().startsWith(event.query.toLowerCase());
          });
        }
      }, 250);
    },
    onCellEdit(newValue, props) {
      if (!this.editingCellRows[props.index]) {
        this.editingCellRows[props.index] = { ...props.data };
      }
      this.editingCellRows[props.index][props.column.field] = newValue;
    },
    getOperationLabel(Label) {
      const Operations = this.$data.Operations.find((r) => r.Label == Label);
      return (Operations || {}).Name;
    },
    async openNew() {
      const formData = {
        module: "userdocright",
        form: "UserDataRight",
        UserAuthID: localStorage.getItem("UserAuthID"),
        data: {
          DocMovement: {
            id: this.$data.FormData.DocMovement.id,
            Name: this.$data.FormData.DocMovement.Name,
          },
          Entity: [
            {
              Parent: this.$data.FormData.DocMovement.id,
            },
          ],
        },
      };
      const answer = await this.$axios.$post("api", formData);
      if (answer.Error)
        this.$data.messages = [{ severity: "error", content: answer.Error }];
      else this.$data.FormData.Entity.push(answer.Entity);
      //console.log("formData=", formData);
      //window.location.reload();
    },
    async deleteSelectedRow() {
      const formData = {
        data: {
          module: "userdocright",
          form: "UserDataRight",
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
    clickExit() {
      this.$router.push("/modules/userdocright/UserDataRightReestr");
    },
    async clickSave() {
      this.$data.FormData.Entity.forEach((row) => {
        //console.log('row=',row);
        row.Column_Value = (row.Column_Value || {}).id;
      });
      const formData = {
        module: "userdocright",
        form: "UserDataRight",
        UserAuthID: localStorage.getItem("UserAuthID"),
        data: this.$data.FormData,
      };
      //console.log("formData=", formData.data);
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
