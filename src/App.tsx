import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee, Transaction } from "./utils/types"

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [isLoading, setIsLoading] = useState(false)
  const [isEmployeesLoading, setIsEmployeesLoading] = useState(false)
  const [isNewEmployeeSelected, setIsNewEmployeeSelected] = useState(false)
  const [isAllEmployeesSelected, setIsAllEmployeesSelected] = useState(false)

  const [transactions, setTransactions] = useState<Array<any>>([]);

  useEffect(() => {
    console.log('in effect ', isNewEmployeeSelected)
    if (isNewEmployeeSelected) {
      setTransactions(transactionsByEmployee as any)
    } else if(isAllEmployeesSelected) {
      setTransactions(paginatedTransactions?.data ?? transactionsByEmployee ?? [] as any)
    }else {

      setTransactions([...paginatedTransactions?.data ?? transactionsByEmployee ?? [] as any, ...transactions])
    }
  }, [paginatedTransactions, transactionsByEmployee, isNewEmployeeSelected]);
  

  const loadAllTransactions = useCallback(async () => {
    setIsLoading(true)
    setIsEmployeesLoading(true)
    transactionsByEmployeeUtils.invalidateData()

    await employeeUtils.fetchAll()
    setIsEmployeesLoading(false)
    await paginatedTransactionsUtils.fetchAll()

    setIsLoading(false)
    setIsAllEmployeesSelected(false)
  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      paginatedTransactionsUtils.invalidateData()
      await transactionsByEmployeeUtils.fetchById(employeeId)
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions()
    }
  }, [employeeUtils.loading, employees, loadAllTransactions])

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={isEmployeesLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null || newValue.id === "") {
              setIsNewEmployeeSelected(false)
              setIsAllEmployeesSelected(true)
              await loadAllTransactions()
            } else {
              setIsAllEmployeesSelected(false)
              await loadTransactionsByEmployee(newValue.id)
              setIsNewEmployeeSelected(true)
            }
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions transactions={transactions} />

          {transactions !== null && transactions?.length%5 === 0 && !isNewEmployeeSelected &&(
            <button
              className="RampButton"
              disabled={paginatedTransactionsUtils.loading}
              onClick={async () => {
                await loadAllTransactions()
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}
