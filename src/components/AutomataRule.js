import React, { useState, useRef, useCallback, useEffect } from "react";
import styled from "@emotion/styled";

export const RULES = {
  Rule30: {
    name: "Rule30",
    rules: {
      "111": 0,
      "110": 0,
      "101": 0,
      "100": 1,
      "011": 1,
      "010": 1,
      "001": 1,
      "000": 0,
    },
  },
  Rule90: {
    name: "Rule90",
    rules: {
      "111": 0,
      "110": 1,
      "101": 0,
      "100": 1,
      "011": 2,
      "010": 0,
      "001": 3,
      "000": 0,
    },
  },
  Rule110: {
    name: "Rule110",
    rules: {
      "111": 0,
      "110": 1,
      "101": 1,
      "100": 0,
      "011": 1,
      "010": 1,
      "001": 1,
      "000": 0,
    },
  },
  Rule182: {
    name: "Rule182",
    rules: {
      "111": 1,
      "110": 0,
      "101": 2,
      "100": 1,
      "011": 0,
      "010": 2,
      "001": 1,
      "000": 0,
    },
  },
  Rule184: {
    name: "Rule184",
    rules: {
      "111": 1,
      "110": 0,
      "101": 1,
      "100": 1,
      "011": 1,
      "010": 0,
      "001": 0,
      "000": 0,
    },
  },
};

const COLORS = {
  0: "beige",
  1: "green",
  2: "lime",
  3: "lightgreen",
};

const rowsPerStep = 3;
const maxRows = 300;
const blockSize = 2;

export function Automata({ width = 600, defaultRule = RULES.Rule90 }) {
  const timer = useRef();
  const rowsArray = useRef([]);
  const activeRule = useRef(defaultRule);
  const [initialState] = useState(
    Array(width)
      .fill(0)
      .map((i) => Math.floor(Math.random() + 0.5))
  );
  const [rows, setRows] = useState([]);

  const getRow = useCallback((rowData) => {
    const newRow = [];

    rowData.forEach((r, i) => {
      const thisSet =
        i === 0
          ? `${Math.floor(Math.random() + 0.5)}${rowData[0]}${rowData[1]}`
          : i === rowData.length - 1
          ? `${rowData[rowData.length - 2]}${
              rowData[rowData.length - 1]
            }${Math.floor(Math.random() + 0.5)}`
          : `${rowData[i - 1]}${rowData[i]}${rowData[i + 1]}`;
      newRow.push(
        activeRule.current.rules[
          thisSet.replace(/3/gi, "1").replace(/2/gi, "1")
        ]
      );
    });

    rowsArray.current.push({
      key: rowsArray.current.length,
      data: newRow,
    });
  }, []);

  const updateAutomata = useCallback(() => {
    for (let i = 0; i < rowsPerStep; i++) {
      getRow(rowsArray.current[rowsArray.current.length - 1].data);
    }

    setRows([...rowsArray.current]);
    if (rowsArray.current.length < maxRows) {
      timer.current = requestAnimationFrame(updateAutomata);
    }
  }, [getRow]);

  useEffect(() => {
    if (!rows.length) {
      rowsArray.current.push({ key: 0, data: initialState });
      setRows([...rowsArray.current]);
      timer.current = requestAnimationFrame(updateAutomata);
    }
    return () => {
      cancelAnimationFrame(timer.current);
    };
  }, []);

  const onRuleChange = useCallback(
    (e) => {
      console.log(e.target.value);
      cancelAnimationFrame(timer.current);
      rowsArray.current = [{ key: 0, data: initialState }];
      activeRule.current = RULES[e.target.value];
      setRows([...rowsArray.current]);

      timer.current = requestAnimationFrame(updateAutomata);
    },
    [initialState, updateAutomata]
  );

  return (
    <>
      <div>
        <select onChange={onRuleChange} value={activeRule.current.name}>
          {Object.keys(RULES).map((rule) => (
            <option key={rule} value={rule}>
              {RULES[rule].name}
            </option>
          ))}
        </select>{" "}
        - {rows.length}
      </div>
      <Container width={width}>
        {rows.map((row) => (
          <MemoizedAutomataRow key={row.key} data={JSON.stringify(row.data)} />
        ))}
      </Container>
    </>
  );
}

//////////////////////////////////////////////////////////////////////

function AutomataRow({ data }) {
  const values = React.useMemo(() => {
    return JSON.parse(data);
  }, [data]);
  return (
    <BlockRow>
      {values.map((value, idx) => (
        <AutoBlock key={idx} value={value} />
      ))}
    </BlockRow>
  );
}

//////////////////////////////////////////////////////////////////////

const MemoizedAutomataRow = React.memo(AutomataRow);

//////////////////////////////////////////////////////////////////////

const AutoBlock = React.memo(function MyComponent({ value }) {
  return <Block color={COLORS[value]} />;
});

const Container = styled.div`
  max-width: 90%;
  font-family: Courier;
  /*  max-height: 80vh;
  overflow-y: scroll; */
  margin: 30px auto;
  font-size: ${blockSize}px;
  width: ${({ width }) => width * blockSize}px;
`;

const BlockRow = styled.div`
  display: flex;
`;

const Block = styled.span`
  display: inline-block;
  flex: 0 1 1em;
  width: 1em;
  height: 1em;
  background-color: ${({ color }) => color || "transparent"};
`;
