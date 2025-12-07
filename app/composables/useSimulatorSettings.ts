export const useSimulatorSettings = () => {
  const hopLimit = useState('simulator-hop-limit', () => 3)

  return {
    hopLimit
  }
}
